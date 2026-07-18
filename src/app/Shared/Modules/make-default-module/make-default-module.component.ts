import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { apiService } from 'src/app/api.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { BankAccountService } from 'src/app/BankAccount/bank-account.service';

@Component({
  selector: 'app-make-default-module',
  templateUrl: './make-default-module.component.html',
  styleUrls: ['./make-default-module.component.css']
})
export class MakeDefaultModuleComponent {
  makeDefaultType: string = '';
  title: string = ''
  obj: any;

  returnType: any;
  returnValue: any;
  returnStatus: any;

  constructor(public bsModalRef:BsModalRef, 
    private router:Router, private toasterService: ToastrService
    , private apiservices:apiService, private authService: AuthService
    , private bankAccountService: BankAccountService){
      
  }

  makedefault(){
    switch(this.makeDefaultType){
      case 'adminbank':
        this.make_admin_bank_account_default();
        break;
      case 'adminupi':
        this.make_admin_upi_default();
        break;
      case 'adminqr':
        this.make_admin_qr_default();
        break;
      case 'userbank':
        this.make_user_bank_account_default();
        break;
      case 'userupi':
        this.make_user_upi_default();
        break;
      case 'userqr':
        this.make_user_qr_default();
        break;
    }
  }

  private get sessionUser() {
    return this.authService.user.userId;
  }

  make_admin_bank_account_default(){
    const payload = { sessionUser: this.sessionUser, bankDetailID: this.obj?.bankAccountDetailID };
    this.apiservices.SetDefaultAdminBankAccount(payload).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  make_admin_upi_default(){
    const payload = { sessionUser: this.sessionUser, upiId: this.obj?.bankAccountDetailID };
    this.apiservices.SetDefaultAdminUpiAccount(payload).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  make_admin_qr_default(){
    const payload = { sessionUser: this.sessionUser, qrId: this.obj?.qrId ?? this.obj?.bankAccountDetailID };
    this.apiservices.SetDefaultAdminQr(payload).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  make_user_bank_account_default(){
    this.apiservices.SetDefaultBankAccount(this.sessionUser, this.obj?.bankAccountDetailID).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  make_user_upi_default(){
    this.bankAccountService.Set_Default_User_Upi(this.obj?.bankAccountDetailID).subscribe(resp => {
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  make_user_qr_default(){
    this.bankAccountService.Set_Default_User_QR(this.obj?.qrId ?? this.obj?.bankAccountDetailID).subscribe(resp => {
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  toastrMessages(){
    this.returnStatus = this.returnType['returnStatus']; 
    if(this.returnStatus == 1){
      this.toasterService.success(this.returnType['returnMessage']);
    }else{
      this.toasterService.warning(this.returnType['returnMessage']);
    }
    this.bsModalRef.hide()
  }

}
