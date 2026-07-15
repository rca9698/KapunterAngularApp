import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BankAccountService } from '../../bank-account.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { Iadd_admin_bank_account, add_admin_bank_account } from 'src/app/Shared/Modals/BankAccount/add_admin_bank_account';

@Component({
  selector: 'app-add-admin-upi',
  templateUrl: './add-admin-upi.component.html',
  styleUrls: ['./add-admin-upi.component.css']
})
export class AddAdminUPIComponent implements OnInit {
  submitted = false;
  addAdminUpiForm: FormGroup;
  obj: Iadd_admin_bank_account = new add_admin_bank_account();
  siteName = '';
  returnType: any;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private bankAccountService: BankAccountService,
    private toasterService: ToastrService,
    private authservice: AuthService
  ) {
    this.addAdminUpiForm = this.formBuilder.group({
      UpiName: ['', [Validators.required]],
      UpiId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.obj?.userName || this.obj?.upiId) {
      this.addAdminUpiForm.patchValue({
        UpiName: this.obj.userName,
        UpiId: this.obj.upiId
      });
    }
  }

  AddAdminUpi(): void {
    this.submitted = true;

    if (this.addAdminUpiForm.invalid) {
      return;
    }

    if (!this.obj?.siteId) {
      this.toasterService.warning('Site is required.');
      return;
    }

    const siteId = Number(this.obj.siteId);
    const payload: Iadd_admin_bank_account = {
      ...this.obj,
      siteId,
      userName: this.addAdminUpiForm.value.UpiName,
      upiId: this.addAdminUpiForm.value.UpiId,
      userId: this.authservice.user.userId,
      sessionUser: this.authservice.user.userId
    };

    this.bankAccountService.add_update_admin_upi(payload).subscribe({
      next: (resp: any) => {
        this.returnType = resp;
        const status = Number(resp?.returnStatus ?? resp?.ReturnStatus ?? 0);
        const message = resp?.returnMessage ?? resp?.ReturnMessage ?? '';
        if (status === 1) {
          this.toasterService.success(message || 'UPI details saved.');
          this.bsModalRef.hide();
        } else {
          this.toasterService.warning(message || 'Unable to save UPI details.');
        }
      },
      error: () => {
        this.toasterService.error('Unable to save UPI details.');
      }
    });
  }
}
