import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DepositeListComponent } from './deposite_list/deposite-list.component';
import { WithdrawListComponent } from './withdraw_list/withdraw-list.component';
import { DepositeToSiteListComponent } from './deposite_to_site_list/deposite-to-site-list.component';
import { WithdrawFromSiteListComponent } from './withdraw_from_site_list/withdraw-from-site-list.component';

const routes : Routes = [
  { path: 'deposite-list', component: DepositeListComponent },
  { path: 'withdraw-list', component: WithdrawListComponent },
  { path: 'deposite-to-site-list', component: DepositeToSiteListComponent },
  { path: 'withdraw-from-site-list', component: WithdrawFromSiteListComponent },
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
export class CoinsRoutingModule { 
  
}
