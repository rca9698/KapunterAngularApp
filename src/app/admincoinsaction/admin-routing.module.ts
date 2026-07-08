import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DeletedUserListComponent } from './User/deleted-user-list/deleted-user-list.component';
import { UserListComponent } from './User/user-list/user-list.component';
import { IsAuthenticatedGuard } from '../is-authenticated.guard';
import { HasRoleGuard } from '../has-role.guard';

const routes: Routes = [
  { path: 'id_request_list', redirectTo: '/ids/list-id-requests', pathMatch: 'full' },
  { path: 'deleted_id_request_list', redirectTo: '/ids/deleted-id-requests', pathMatch: 'full' },
  { path: 'user_list', component: UserListComponent },
  { path: 'deleted_user_list', component: DeletedUserListComponent },
  {
    path: 'coins',
    loadChildren: () => import('../admincoinsaction/coins/coins.module').then(module => module.CoinsModule),
    canActivate: [IsAuthenticatedGuard, HasRoleGuard],
    data: { role: 'admin' }
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
