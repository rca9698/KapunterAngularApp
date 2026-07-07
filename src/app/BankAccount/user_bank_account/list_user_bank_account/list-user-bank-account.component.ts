import { Component, OnInit } from '@angular/core';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { BankAccountService } from '../../bank-account.service';
import { GetUserBankAccount, IGetUserBankAccount } from 'src/app/Shared/Modals/BankAccount/get_user_bank_account'
import { AuthService } from 'src/app/auth.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { MakeDefaultService } from 'src/app/Shared/Modules/make-default-module/make-default.service';
import { Iadd_bank_account, add_bank_account } from 'src/app/Shared/Modals/BankAccount/add_bank_account';

@Component({
  selector: 'app-list-user-bank-account',
  templateUrl: './list-user-bank-account.component.html',
  styleUrls: ['./list-user-bank-account.component.css']
})
export class ListUserBankAccountComponent implements OnInit {
  Ibank_details: Ibank_details[] | undefined; 
  Iuser_upi_details: any[] | undefined;
  Iuser_qr_details: any[] | undefined;
  returnType: any;
  getbankaccount: IGetUserBankAccount = new GetUserBankAccount();
  add_bank_account: Iadd_bank_account = new add_bank_account();
  isActive: boolean = false;

  constructor(private bankaccount: BankAccountService, private authService: AuthService
    , private deleteService: DeleteService, private makedefaultservice: MakeDefaultService 
  ) {

  }

  ngOnInit(): void {
    this.list_User_Bank_Accounts();
    this.list_User_Upi_Accounts();
    this.list_User_QR_Accounts();
  }

  list_User_Bank_Accounts(){
    this.isActive = true;
    const bank_details = new GetUserBankAccount(); 
    bank_details.isActive = 1;
    bank_details.sessionUser = this.authService.user.userId;
    bank_details.userId = this.authService.user.userId;

    this.bankaccount.list_User_Bank_Accounts(bank_details).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.Ibank_details = this.returnType['returnList'];
      },
      error:error => {
        console.log(error);
      }
    });
  }

  list_User__InActive_Bank_Accounts(){
    this.isActive = false;
    const bank_details = new GetUserBankAccount(); 
    bank_details.isActive = 0;
    bank_details.sessionUser = this.authService.user.userId;
    bank_details.userId = this.authService.user.userId;

    this.bankaccount.list_User_Bank_Accounts(bank_details).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.Ibank_details = this.returnType['returnList'];
      },
      error:error => {
        console.log(error);
      }
    });
  }

  list_User__All_Bank_Accounts(){
    this.isActive = false;
    const bank_details = new GetUserBankAccount(); 
    bank_details.isActive = 2;
    bank_details.sessionUser = this.authService.user.userId;
    bank_details.userId = this.authService.user.userId;

    this.bankaccount.list_User_Bank_Accounts(bank_details).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.Ibank_details = this.returnType['returnList'];
      },
      error:error => {
        console.log(error);
      }
    });
  }

  AddBankDetailPopup() {
    this.bankaccount.OpenUserBankAccountPopup(false, this.add_bank_account);
  }

  AddUserUpiPopup() {
    this.bankaccount.OpenUserUpiPopup();
  }

  AddUserQRPopup() {
    this.bankaccount.OpenUserQRPopup();
  }

  list_User_Upi_Accounts(isActive: number = 1) {
    this.bankaccount.list_User_Upi_Accounts({ isActive }).subscribe({
      next: (response) => {
        this.returnType = response;
        this.Iuser_upi_details = this.returnType['returnList'];
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  list_User_QR_Accounts(isActive: number = 1) {
    this.bankaccount.list_User_QR_Accounts({ isActive }).subscribe({
      next: (response) => {
        this.returnType = response;
        this.Iuser_qr_details = this.returnType['returnList'];
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  MakeUpiDetailDefault(obj: any) {
    this.makedefaultservice.OpenMakeDefaultPopup('userupi', 'UPI', obj);
  }

  DeleteUpiDetailPopup(obj: any) {
    this.deleteService.OpenDeletePopup('userupi', 'UPI', obj);
  }

  MakeQRDetailDefault(obj: any) {
    this.makedefaultservice.OpenMakeDefaultPopup('userqr', 'QR', obj);
  }

  DeleteQRDetailPopup(obj: any) {
    this.deleteService.OpenDeletePopup('userqr', 'QR', obj);
  }

  MakeBankDetailDefault(obj: any) {
    this.makedefaultservice.OpenMakeDefaultPopup('userbank','Bank',obj);
  }

  DeleteBankAccountPopup(obj: any) {
    this.deleteService.OpenDeletePopup('userbank','Bank',obj);
  }
}
