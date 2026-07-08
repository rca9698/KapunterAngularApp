import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Iadd_admin_bank_account, add_admin_bank_account } from 'src/app/Shared/Modals/BankAccount/add_admin_bank_account';
import { BankAccountService } from '../../bank-account.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { CommonService } from 'src/app/common.service';

@Component({
  selector: 'app-add-admin-qr',
  templateUrl: './add-admin-qr.component.html',
  styleUrls: ['./add-admin-qr.component.css']
})
export class AddAdminQRComponent implements OnInit {
  submitted = false;
  addAdminQrForm: FormGroup;
  obj: Iadd_admin_bank_account = new add_admin_bank_account();
  siteName = '';
  returnType: any;
  file: File | null = null;
  selectedFileName: string | null = null;
  isupdate = false;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private bankAccountService: BankAccountService,
    private toasterService: ToastrService,
    private authservice: AuthService,
    private commonService: CommonService
  ) {
    this.addAdminQrForm = this.formBuilder.group({
      QRName: ['', [Validators.required]]
    });
  }

  @ViewChild('imageInput') fileInput: any;

  ngOnInit(): void {
    if (this.obj?.userName) {
      this.addAdminQrForm.patchValue({ QRName: this.obj.userName });
    }
  }

  processFile(imageInput: HTMLInputElement): void {
    const f = imageInput.files?.[0];
    this.file = f ?? null;
    this.selectedFileName = f?.name ?? null;
  }

  AddAdminQR(): void {
    this.submitted = true;

    if (this.addAdminQrForm.invalid || !this.file) {
      return;
    }

    if (!this.obj?.siteId) {
      this.toasterService.warning('Site is required.');
      return;
    }

    const formParams = new FormData();
    formParams.append('File', this.file);
    formParams.append('userName', this.addAdminQrForm.value.QRName);
    formParams.append('userId', this.authservice.user.userId.toString());
    formParams.append('sessionUser', this.authservice.user.userId.toString());
    formParams.append('siteId', this.obj.siteId.toString());

    this.bankAccountService.add_admin_qr(formParams).subscribe({
      next: (resp) => {
        this.returnType = resp;
        this.commonService.toastrMessages(this.returnType);
        if (this.returnType?.returnStatus == 1) {
          this.bsModalRef.hide();
        }
      },
      error: () => {
        this.toasterService.error('Unable to save QR code.');
      }
    });
  }
}
