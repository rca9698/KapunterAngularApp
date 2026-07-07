import { Component } from '@angular/core';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { BankAccountService } from '../../bank-account.service';
import { AuthService } from 'src/app/auth.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { MakeDefaultService } from 'src/app/Shared/Modules/make-default-module/make-default.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-list-admin-qr',
  templateUrl: './list-admin-qr.component.html',
  styleUrls: ['./list-admin-qr.component.css']
})
export class ListAdminQRComponent {
  Ibank_details: Ibank_details[] | undefined; 
  returnType:any;
  qrPath: string | undefined;

  constructor(private bankaccountservice:BankAccountService, private authService:AuthService
    , private deleteService: DeleteService, private makedefaultservice: MakeDefaultService) {
      this.qrPath = environment.imagePath.QR;
  }
  
  ngOnInit(): void {
    this.list_admin_QRs();
  }

  Add_Admin_QR_Popup() {
    this.bankaccountservice.OpenAddAdminQRPopup(false);
  }

  Make_Admin_QR_Default(obj: any) {
    this.makedefaultservice.OpenMakeDefaultPopup('adminqr','QR',obj);
  }

  Delete_Admin_QR(obj: any) {
    this.deleteService.OpenDeletePopup('adminqr','QR',obj);
  }

  list_admin_QRs(){
    this.bankaccountservice.list_admin_QR_accounts().subscribe({
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
