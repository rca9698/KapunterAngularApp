import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListSitesComponent } from './listSites/list-sites.component';
import { UserListSitesComponent } from './userListSites/user-list-sites.component';
import { GetUserListSiteByIdComponent } from './getUserListSiteById/get-user-list-site-by-id.component';

const routes : Routes = [
  { path: 'list-sites', component: ListSitesComponent },
  { path: 'user-list-sites', component: UserListSitesComponent },
  { path: 'app-get-user-list-site-by-id',  component: GetUserListSiteByIdComponent },
  { path: 'app-get-user-list-site-by-id/:userId',  component: GetUserListSiteByIdComponent }
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
export class SitesRoutingModule { }
