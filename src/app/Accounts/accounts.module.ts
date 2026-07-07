import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountRoutingModule } from './account-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { UserListComponent } from '../admincoinsaction/User/user-list/user-list.component';
import { DeletedUserListComponent } from '../admincoinsaction/User/deleted-user-list/deleted-user-list.component';
import { DeletedIdRequestListComponent } from '../admincoinsaction/Ids/deleted-id-request-list/deleted-id-request-list.component';
import { DeletedIdsListComponent } from '../admincoinsaction/Ids/deleted-ids-list/deleted-ids-list.component';
import { IdsListComponent } from '../admincoinsaction/Ids/ids-list/ids-list.component';
import { CoinsModule } from '../admincoinsaction/coins/coins.module';
import { ProfileDetailsComponent } from './Profile/profile-details/profile-details.component';

@NgModule({
  declarations: [
    UserListComponent,
    DeletedUserListComponent,
    DeletedIdRequestListComponent,
    DeletedIdsListComponent,
    IdsListComponent,
    ProfileDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AccountRoutingModule,
    HttpClientModule,
    CoinsModule,
    ModalModule.forRoot()
  ],
  exports:[
    ReactiveFormsModule
  ]
})
export class AccountsModule { 

}
