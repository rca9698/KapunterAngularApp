import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepositeCoinsByUserIdComponent } from './admin_deposite_coins_by_user_id/admin-deposite-coins-by-user-id.component';
import { WithdrawCoinsUserIdComponent } from './withdraw_coins_user_id/withdraw-coins-user-id.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AccountRoutingModule } from '../../Accounts/account-routing.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DepositeListComponent } from './deposite_list/deposite-list.component';
import { WithdrawListComponent } from './withdraw_list/withdraw-list.component';
import { DepositeToSiteListComponent } from './deposite_to_site_list/deposite-to-site-list.component';
import { WithdrawFromSiteListComponent } from './withdraw_from_site_list/withdraw-from-site-list.component';
import { CoinsRoutingModule } from './coins-routing.module';
import { WalletRequestModalsModule } from '../../userids/wallet-request-modals.module';
import { AdminWithdrawCoinsByRequestIdComponent } from './admin_withdraw_coins_by_request_id/admin-withdraw-coins-by-request-id.component';
import { AdminDepositeCoinsByRequestIdComponent } from './admin_deposite_coins_by_request_id/admin-deposite-coins-by-request-id.component';
import { AdminWithdrawCoinsToIdRequestIdComponent } from './admin_withdraw_coins_to_id_request_id/admin-withdraw-coins-to-id-request-id.component';
import { AdminDepositeCoinsToIdRequestIdComponent } from './admin_deposite_withdraw_coins_ids_by_request_id/admin-deposite-coins-to-id-request-id.component';



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
    AdminDepositeCoinsToIdRequestIdComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CoinsRoutingModule,
    HttpClientModule,
    ModalModule.forRoot(),
    WalletRequestModalsModule
  ],
  exports:[
    ReactiveFormsModule
  ]
})
export class CoinsModule { }
