import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinsRoutingModule } from './coins-routing.module';
import { CoinsSharedModule } from './coins-shared.module';
import { DepositToSiteHistoryComponent } from './deposit_to_site_history/deposit-to-site-history.component';
import { WithdrawFromSiteHistoryComponent } from './withdraw_from_site_history/withdraw-from-site-history.component';

/**
 * Lazy-loaded coin request pages under /adminaction/coins/*
 * Do NOT import this module eagerly into AdminModule (that blocks lazy routes).
 * For modals from User List, import CoinsSharedModule instead.
 *
 * History pages are declared here (not in CoinsSharedModule) so the lazy
 * router can instantiate them reliably.
 */
@NgModule({
  declarations: [
    DepositToSiteHistoryComponent,
    WithdrawFromSiteHistoryComponent
  ],
  imports: [
    CommonModule,
    CoinsSharedModule,
    CoinsRoutingModule
  ]
})
export class CoinsModule { }
