import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { apiService } from 'src/app/api.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { serializeForApi } from 'src/app/Shared/Utils/api-serialize.util';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.css']
})
export class ChangePasswordModalComponent implements OnInit {
  changePasswordForm: FormGroup;
  submitted = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  saving = false;
  /** When true, current password is required (account already has a password). */
  hasPassword = false;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private apiservice: apiService,
    private authService: AuthService,
    private toasterService: ToastrService
  ) {
    this.changePasswordForm = this.formBuilder.group({
      currentPassword: [''],
      changePassword: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.hasPassword = !!this.authService.userdetail?.hasPassword;
    const currentCtrl = this.changePasswordForm.get('currentPassword');
    if (this.hasPassword) {
      currentCtrl?.setValidators([Validators.required]);
    } else {
      currentCtrl?.clearValidators();
      currentCtrl?.setValue('');
    }
    currentCtrl?.updateValueAndValidity();
  }

  get modalTitle(): string {
    return this.hasPassword ? 'Change Password' : 'Set Password';
  }

  get submitLabel(): string {
    if (this.saving) {
      return 'Saving…';
    }
    return this.hasPassword ? 'Update Password' : 'Set Password';
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submitChangePassword(): void {
    this.submitted = true;

    if (this.changePasswordForm.invalid) {
      return;
    }

    const { currentPassword, changePassword, confirmPassword } = this.changePasswordForm.value;
    if (changePassword !== confirmPassword) {
      this.toasterService.warning('New password and confirm password do not match.');
      return;
    }

    this.saving = true;
    const payload = serializeForApi({
      userId: this.authService.user.userId,
      mobileNumber: this.authService.userdetail.userNumber,
      currentPassword: this.hasPassword ? (currentPassword ?? '') : '',
      changePassword,
      confirmPassword
    });

    this.apiservice.ChangePassword(payload).subscribe({
      next: (response: any) => {
        this.saving = false;
        if (response?.returnStatus === 1) {
          this.toasterService.success(response?.returnMessage ?? 'Password updated');
          if (this.authService.userdetail) {
            this.authService.userdetail.hasPassword = true;
          }
          this.bsModalRef.hide();
        } else {
          this.toasterService.warning(response?.returnMessage ?? 'Unable to update password');
        }
      },
      error: () => {
        this.saving = false;
        this.toasterService.warning('Unable to update password');
      }
    });
  }
}
