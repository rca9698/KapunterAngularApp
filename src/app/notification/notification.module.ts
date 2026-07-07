import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationRoutingModule } from './notification-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NotificationRoutingModule,
    HttpClientModule,
    ModalModule.forRoot()
  ]
})
export class NotificationModule { }
