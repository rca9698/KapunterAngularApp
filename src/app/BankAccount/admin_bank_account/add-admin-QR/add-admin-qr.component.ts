import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Iadd_admin_bank_account, add_admin_bank_account } from 'src/app/Shared/Modals/BankAccount/add_admin_bank_account';
import { BankAccountService } from '../../bank-account.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/common.service';

@Component({
  selector: 'app-add-admin-qr',
  templateUrl: './add-admin-qr.component.html',
  styleUrls: ['./add-admin-qr.component.css']
})
export class AddAdminQRComponent {
  submitted : boolean = false;
  addAdminQrForm: FormGroup;
  add_admin_qr: Iadd_admin_bank_account = new add_admin_bank_account();
  returnType: any;
  file: File | null = null;
  selectedFileName: string | null = null;
  isupdate: boolean = false;

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private bankAccountService: BankAccountService, 
    private toasterService: ToastrService, private authservice: AuthService,
    private commonService: CommonService){ 
      this.addAdminQrForm = this.formBuilder.group({
        QRName: ['', [Validators.required]],
       },
     )
    }

    @ViewChild('imageInput') fileInput: any

  processFile(imageInput: HTMLInputElement) {
    const f = imageInput.files?.[0];
    this.file = f ?? null;
    this.selectedFileName = f?.name ?? null;
  }
  
    AddAdminQR() {
      this.submitted = true;

      if (this.addAdminQrForm.invalid || !this.file) {
        return;
      }

      let formParams = new FormData();
      formParams.append('File', this.file);
      formParams.append('userName',  this.add_admin_qr.userName);
      formParams.append('userId',  this.authservice.user.userId.toString());
      formParams.append('sessionUser', this.authservice.user.userId.toString());
 
      this.bankAccountService.add_admin_qr(formParams).subscribe(resp => {
        this.returnType = resp;
        this.commonService.toastrMessages(this.returnType);
      });

    }
}
