import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListAdminBankAccountComponent } from './admin_bank_account/list-admin-bank-account/list-admin-bank-account.component';
import { AddAdminBankAccountComponent } from './admin_bank_account/add-admin-bank-account/add-admin-bank-account.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountRoutingModule } from '../Accounts/account-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ListUserBankAccountComponent } from './user_bank_account/list_user_bank_account/list-user-bank-account.component';
import { AddUserBankAccountComponent } from './user_bank_account/add_user_bank_account/add-user-bank-account.component';
import { AddUserUpiComponent } from './user_bank_account/add_user_upi/add-user-upi.component';
import { AddUserQrComponent } from './user_bank_account/add_user_qr/add-user-qr.component';
import { BankAccountRoutingModule } from './bank-account-routing.module';
import { ListAdminUPIComponent } from './admin_bank_account/list-admin-UPI/list-admin-upi.component';
import { AddAdminQRComponent } from './admin_bank_account/add-admin-QR/add-admin-qr.component';
import { AddAdminUPIComponent } from './admin_bank_account/add-Admin-UPI/add-admin-upi.component';
import { ListAdminQRComponent } from './admin_bank_account/list-admin-QR/list-admin-qr.component';
import { AdminVendorSitesListComponent } from './admin_bank_account/admin-vendor-sites-list/admin-vendor-sites-list.component';
import { ViewAdminSitePaymentComponent } from './admin_bank_account/view-admin-site-payment/view-admin-site-payment.component';
import { AddAdminSitePaymentComponent } from './admin_bank_account/add-admin-site-payment/add-admin-site-payment.component';



@NgModule({
  declarations: [
    AddAdminBankAccountComponent,
    AddUserBankAccountComponent,
    AddUserUpiComponent,
    AddUserQrComponent,
    AddAdminQRComponent,
    AddAdminUPIComponent,
    ListAdminBankAccountComponent,
    ListAdminQRComponent,
    ListAdminUPIComponent,
    ListUserBankAccountComponent,
    AdminVendorSitesListComponent,
    ViewAdminSitePaymentComponent,
    AddAdminSitePaymentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BankAccountRoutingModule,
    HttpClientModule,
    ModalModule.forRoot()
  ],
  exports:[
    ReactiveFormsModule
  ]
})
export class BankAccountModule { 
  
}
