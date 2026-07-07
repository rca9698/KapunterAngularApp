import { Component, OnInit } from '@angular/core';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { BankAccountService } from '../../bank-account.service';
import { DeleteAdminBankAccount, IDeleteAdminBankAccount } from 'src/app/Shared/Modals/BankAccount/delete_admin_bank_account';
import { AuthService } from 'src/app/auth.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { MakeDefaultService } from 'src/app/Shared/Modules/make-default-module/make-default.service';

@Component({
  selector: 'app-list-admin-bank-account',
  templateUrl: './list-admin-bank-account.component.html',
  styleUrls: ['./list-admin-bank-account.component.css']
})
export class ListAdminBankAccountComponent implements OnInit {
  Ibank_details: Ibank_details[] | undefined; 
  returnType:any;
  delete_admin_bankAccount: IDeleteAdminBankAccount = new DeleteAdminBankAccount();
  
  constructor(private bankaccountservice:BankAccountService, private authService: AuthService
    , private deleteService: DeleteService, private makedefaultservice: MakeDefaultService 
  ) {

  }

  ngOnInit(): void {
    this.list_Admin_Bank_Accounts();
  }

  AddAdminBankDetailPopup() {
    this.bankaccountservice.OpenAddAdminBankAccountPopup(false);
  }

  MakeAdminBankDefault(obj: any) {
    this.makedefaultservice.OpenMakeDefaultPopup('adminbank','Bank',obj);
  }

  DeleteAdminBankAccount(obj: any) {
    this.deleteService.OpenDeletePopup('adminbank','Bank',obj);
  }

  list_Admin_Bank_Accounts(){
    this.bankaccountservice.list_Admin_Bank_Accounts().subscribe({
      next:(response) =>{
       this.returnType = response;
       console.log(this.returnType);
       this.Ibank_details = this.returnType['returnList'];
      },
      error:error => {
        console.log(error);
      }
    });
  }

}
