import { Component, OnInit } from '@angular/core';
import { BankAccountService } from '../../bank-account.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { Iadd_admin_bank_account, add_admin_bank_account } from 'src/app/Shared/Modals/BankAccount/add_admin_bank_account';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-add-admin-bank-account',
  templateUrl: './add-admin-bank-account.component.html',
  styleUrls: ['./add-admin-bank-account.component.css']
})
export class AddAdminBankAccountComponent implements OnInit {
  submitted = false;
  addAdminBankAccountForm: FormGroup;
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
    this.addAdminBankAccountForm = this.formBuilder.group({
      BName: ['', [Validators.required]],
      ANumber: ['', [Validators.required]],
      AHName: ['', [Validators.required]],
      IFSCCode: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.obj?.bankName) {
      this.addAdminBankAccountForm.patchValue({
        BName: this.obj.bankName,
        AHName: this.obj.accountHolderName,
        ANumber: this.obj.accountNumber,
        IFSCCode: this.obj.ifscCode
      });
    }
  }

  AddAdminBankAccount(): void {
    this.submitted = true;

    if (this.addAdminBankAccountForm.invalid) {
      return;
    }

    const siteId = Number(this.obj?.siteId ?? (this.obj as any)?.SiteId ?? 0);
    if (!siteId) {
      this.toasterService.warning('Site is required.');
      return;
    }

    const payload: Iadd_admin_bank_account = {
      ...this.obj,
      siteId,
      bankName: this.addAdminBankAccountForm.value.BName,
      accountHolderName: this.addAdminBankAccountForm.value.AHName,
      accountNumber: this.addAdminBankAccountForm.value.ANumber,
      ifscCode: this.addAdminBankAccountForm.value.IFSCCode,
      userId: this.authservice.user.userId,
      sessionUser: this.authservice.user.userId
    };

    this.bankAccountService.Add_Admin_Bank_Account(payload).subscribe({
      next: (resp: any) => {
        this.returnType = resp;
        const status = Number(resp?.returnStatus ?? resp?.ReturnStatus ?? 0);
        const message = resp?.returnMessage ?? resp?.ReturnMessage ?? '';

        if (status === 1) {
          this.toasterService.notice('success', 'Bank account added', message || 'Saved for this site.');
          this.bsModalRef.hide();
          return;
        }

        if (status === 2) {
          this.toasterService.notice(
            'warning',
            'Already on file',
            message || 'This bank account number already exists for this site.'
          );
          return;
        }

        this.toasterService.notice(
          'error',
          'Could not save',
          message || 'Unable to save bank account.'
        );
      },
      error: () => {
        this.toasterService.notice('error', 'Could not save', 'Unable to save bank account.');
      }
    });
  }
}
