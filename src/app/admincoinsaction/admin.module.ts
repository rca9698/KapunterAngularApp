import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CoinsModule } from './coins/coins.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { RouterModule } from '@angular/router';
import { UserListComponent } from './User/user-list/user-list.component';
import { DeletedUserListComponent } from './User/deleted-user-list/deleted-user-list.component';
import { UserSiteAccountsHistoryComponent } from './User/user-site-accounts-history/user-site-accounts-history.component';
import { UtilitySettingsComponent } from './Utility/utility-settings/utility-settings.component';
import { LoaderModule } from '../Shared/loader/loader.module';

@NgModule({
  declarations: [
    UserListComponent,
    DeletedUserListComponent,
    UserSiteAccountsHistoryComponent,
    UtilitySettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    HttpClientModule,
    CoinsModule,
    ModalModule.forRoot(),
    LoaderModule
  ],
  exports: [RouterModule]
})
export class AdminModule { }
