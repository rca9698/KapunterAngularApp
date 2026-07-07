import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListUserIdComponent } from './listuserids/list-user-ids.component';

const routes: Routes = [
  { path: 'list-user-ids', component: ListUserIdComponent }
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

export class UserIdRoutingModule { }
