import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListUserBankAccountComponent } from './user_bank_account/list_user_bank_account/list-user-bank-account.component';
import { AdminVendorSitesListComponent } from './admin_bank_account/admin-vendor-sites-list/admin-vendor-sites-list.component';

const routes: Routes = [
  { path: 'list-admin-bank-account', component: AdminVendorSitesListComponent },
  { path: 'list-admin-qr', component: AdminVendorSitesListComponent },
  { path: 'list-admin-upi', component: AdminVendorSitesListComponent },
  { path: 'list-user-bank-account', component: ListUserBankAccountComponent }
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
