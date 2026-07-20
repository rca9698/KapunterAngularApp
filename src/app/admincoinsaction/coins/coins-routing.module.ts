import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DepositeListComponent } from './deposite_list/deposite-list.component';
import { WithdrawListComponent } from './withdraw_list/withdraw-list.component';
import { DepositeToSiteListComponent } from './deposite_to_site_list/deposite-to-site-list.component';
import { WithdrawFromSiteListComponent } from './withdraw_from_site_list/withdraw-from-site-list.component';
import { DepositToSiteHistoryComponent } from './deposit_to_site_history/deposit-to-site-history.component';
import { WithdrawFromSiteHistoryComponent } from './withdraw_from_site_history/withdraw-from-site-history.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'deposite-list' },
  { path: 'deposite-list', component: DepositeListComponent },
  { path: 'withdraw-list', component: WithdrawListComponent },
  { path: 'deposite-to-site-list', component: DepositeToSiteListComponent },
  { path: 'withdraw-from-site-list', component: WithdrawFromSiteListComponent },
  { path: 'deposit-to-site-history', component: DepositToSiteHistoryComponent },
  { path: 'withdraw-from-site-history', component: WithdrawFromSiteHistoryComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class CoinsRoutingModule { }
