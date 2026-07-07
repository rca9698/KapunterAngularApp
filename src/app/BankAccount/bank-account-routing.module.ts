import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListAdminBankAccountComponent } from './admin_bank_account/list-admin-bank-account/list-admin-bank-account.component';
import { ListUserBankAccountComponent } from './user_bank_account/list_user_bank_account/list-user-bank-account.component';
import { ListAdminQRComponent } from './admin_bank_account/list-admin-QR/list-admin-qr.component';
import { ListAdminUPIComponent } from './admin_bank_account/list-admin-UPI/list-admin-upi.component';

const routes: Routes = [
  {path: 'list-admin-bank-account', component: ListAdminBankAccountComponent},
  {path: 'list-admin-qr', component: ListAdminQRComponent},
  {path: 'list-admin-upi', component: ListAdminUPIComponent},
  {path: 'list-user-bank-account', component: ListUserBankAccountComponent}
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class BankAccountRoutingModule { }
