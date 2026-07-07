import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, Routes } from '@angular/router';
import { ListNotificationComponent } from './list-notification/list-notification.component';

const routes: Routes =[
  {path:'list-notification', component: ListNotificationComponent}
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports:[
    RouterModule
  ]
})
export class NotificationRoutingModule { }
