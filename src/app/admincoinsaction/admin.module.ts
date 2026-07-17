import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CoinsSharedModule } from './coins/coins-shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { RouterModule } from '@angular/router';
import { UserListComponent } from './User/user-list/user-list.component';
import { DeletedUserListComponent } from './User/deleted-user-list/deleted-user-list.component';
import { UserSiteAccountsHistoryComponent } from './User/user-site-accounts-history/user-site-accounts-history.component';
import { UtilitySettingsComponent } from './Utility/utility-settings/utility-settings.component';
import { CoinPnlSummaryComponent } from './Utility/coin-pnl-summary/coin-pnl-summary.component';
import { LoaderModule } from '../Shared/loader/loader.module';
import { SingleClickModule } from '../Shared/single-click/single-click.module';

@NgModule({
  declarations: [
    UserListComponent,
    DeletedUserListComponent,
    UserSiteAccountsHistoryComponent,
    UtilitySettingsComponent,
    CoinPnlSummaryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    HttpClientModule,
    // Shared coin modals only — do not import CoinsModule (lazy) here or /coins/* routes never activate
    CoinsSharedModule,
    ModalModule.forRoot(),
    LoaderModule,
    SingleClickModule
  ],
  exports: [RouterModule]
})
export class AdminModule { }
