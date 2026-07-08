import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { BankAccountService } from '../../bank-account.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-add-user-qr',
  templateUrl: './add-user-qr.component.html',
  styleUrls: ['./add-user-qr.component.css']
})
export class AddUserQrComponent {
  submitted = false;
  redirectAfterSave = true;
  addUserQrForm: FormGroup;
  qrName = '';
  returnType: any;
  file: File | null = null;
  selectedFileName: string | null = null;

  @ViewChild('imageInput') fileInput: any;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private router: Router,
    private bankAccountService: BankAccountService,
    private toasterService: ToastrService,
    private authservice: AuthService
  ) {
    this.addUserQrForm = this.formBuilder.group({
      QRName: ['', [Validators.required]]
    });
  }

  processFile(imageInput: HTMLInputElement) {
    const f = imageInput.files?.[0];
    this.file = f ?? null;
    this.selectedFileName = f?.name ?? null;
  }

  Add_User_QR() {
    this.submitted = true;

    if (this.addUserQrForm.invalid || !this.file) {
      return;
    }

    let formParams = new FormData();
      formParams.append('File', this.file);
      formParams.append('userName',  this.qrName);
      formParams.append('userId',  this.authservice.user.userId.toString());
      formParams.append('sessionUser', this.authservice.user.userId.toString());
 
    this.bankAccountService.add_User_qr(formParams).subscribe(resp => {
      this.returnType = resp;
      if (this.returnType['returnStatus'] == 1) {
        this.toasterService.success(this.returnType.returnMessage);
        this.bsModalRef.hide();
        if (this.redirectAfterSave) {
          this.router.navigate(['/bankAccount/list-user-bank-account']);
        }
      } else {
        this.toasterService.warning(this.returnType.returnMessage);
      }
    });
  }
}
