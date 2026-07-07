import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, Routes } from '@angular/router';
import { UserListComponent } from '../admincoinsaction/User/user-list/user-list.component';
import { DeletedUserListComponent } from '../admincoinsaction/User/deleted-user-list/deleted-user-list.component';
import { IdRequestListComponent } from '../admincoinsaction/Ids/id-request-list/id-request-list.component';
import { DeletedIdRequestListComponent } from '../admincoinsaction/Ids/deleted-id-request-list/deleted-id-request-list.component';
import { ProfileDetailsComponent } from './Profile/profile-details/profile-details.component';

const routes : Routes = [
  { path: 'profile-details', component: ProfileDetailsComponent }
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
export class AccountRoutingModule {

}