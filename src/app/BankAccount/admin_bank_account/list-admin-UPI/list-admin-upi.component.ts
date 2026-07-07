import { Component } from '@angular/core';
import { BankAccountService } from '../../bank-account.service';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { MakeDefaultService } from 'src/app/Shared/Modules/make-default-module/make-default.service';

@Component({
  selector: 'app-list-admin-upi',
  templateUrl: './list-admin-upi.component.html',
  styleUrls: ['./list-admin-upi.component.css']
})
export class ListAdminUPIComponent {
  Ibank_details: Ibank_details[] | undefined; 
  returnType:any;

  constructor(private bankaccountservice:BankAccountService, private deleteService: DeleteService
    , private makedefaultservice: MakeDefaultService
  ) {

  }
  
  ngOnInit(): void {
    this.list_admin_upis();
  }

  Add_Admin_Upi_Popup() {
    this.bankaccountservice.OpenAddAdminUpiPopup(false);
  }

  Make_Admin_Upi_Default(obj: any) {
    this.makedefaultservice.OpenMakeDefaultPopup('adminupi','upi',obj);
  }

  Delete_Admin_UpiAccount(obj: any) {
    this.deleteService.OpenDeletePopup('adminupi','upi',obj);
  }

  list_admin_upis(){
    this.bankaccountservice.list_admin_upi_accounts().subscribe({
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
