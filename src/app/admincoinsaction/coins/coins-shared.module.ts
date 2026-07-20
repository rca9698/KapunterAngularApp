import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { WalletRequestModalsModule } from '../../userids/wallet-request-modals.module';
import { LoaderModule } from '../../Shared/loader/loader.module';
import { SingleClickModule } from '../../Shared/single-click/single-click.module';
import { DepositeCoinsByUserIdComponent } from './admin_deposite_coins_by_user_id/admin-deposite-coins-by-user-id.component';
import { WithdrawCoinsUserIdComponent } from './withdraw_coins_user_id/withdraw-coins-user-id.component';
import { DepositeListComponent } from './deposite_list/deposite-list.component';
import { WithdrawListComponent } from './withdraw_list/withdraw-list.component';
import { DepositeToSiteListComponent } from './deposite_to_site_list/deposite-to-site-list.component';
import { WithdrawFromSiteListComponent } from './withdraw_from_site_list/withdraw-from-site-list.component';
import { AdminWithdrawCoinsByRequestIdComponent } from './admin_withdraw_coins_by_request_id/admin-withdraw-coins-by-request-id.component';
import { AdminDepositeCoinsByRequestIdComponent } from './admin_deposite_coins_by_request_id/admin-deposite-coins-by-request-id.component';
import { AdminWithdrawCoinsToIdRequestIdComponent } from './admin_withdraw_coins_to_id_request_id/admin-withdraw-coins-to-id-request-id.component';
import { AdminDepositeCoinsToIdRequestIdComponent } from './admin_deposite_withdraw_coins_ids_by_request_id/admin-deposite-coins-to-id-request-id.component';
import { ViewAdminBankDetailsComponent } from './view_admin_bank_details/view-admin-bank-details.component';

/**
 * Coin UI + modals without routes.
 * Imported by AdminModule (for user-list modals) and by CoinsModule (lazy routed pages).
 * History list pages live in CoinsModule (lazy), not here.
 */
@NgModule({
  declarations: [
    DepositeCoinsByUserIdComponent,
    WithdrawCoinsUserIdComponent,
    DepositeListComponent,
    WithdrawListComponent,
    DepositeToSiteListComponent,
    WithdrawFromSiteListComponent,
    AdminWithdrawCoinsByRequestIdComponent,
    AdminDepositeCoinsByRequestIdComponent,
    AdminWithdrawCoinsToIdRequestIdComponent,
    AdminDepositeCoinsToIdRequestIdComponent,
    ViewAdminBankDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    ModalModule.forRoot(),
    WalletRequestModalsModule,
    LoaderModule,
    SingleClickModule
  ],
  exports: [
    ReactiveFormsModule,
    DepositeCoinsByUserIdComponent,
    WithdrawCoinsUserIdComponent,
    DepositeListComponent,
    WithdrawListComponent,
    DepositeToSiteListComponent,
    WithdrawFromSiteListComponent,
    AdminWithdrawCoinsByRequestIdComponent,
    AdminDepositeCoinsByRequestIdComponent,
    AdminWithdrawCoinsToIdRequestIdComponent,
    AdminDepositeCoinsToIdRequestIdComponent,
    ViewAdminBankDetailsComponent
  ]
})
export class CoinsSharedModule { }
