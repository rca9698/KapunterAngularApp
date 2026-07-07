import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserIdRoutingModule } from './user-id-routing.module';
import { ListUserIdComponent } from './listuserids/list-user-ids.component';
import { CreateIdsComponent } from './createid/create-ids.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DepositeCoinsToIdsComponent } from './deposite-coins-to-ids/deposite-coins-to-ids.component';
import { WithdrawCoinsFromIdsComponent } from './withdraw-coins-from-ids/withdraw-coins-from-ids.component';



@NgModule({
  declarations: [ 
    ListUserIdComponent,
    CreateIdsComponent,
    DepositeCoinsToIdsComponent,
    WithdrawCoinsFromIdsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UserIdRoutingModule,
    HttpClientModule,
    ModalModule.forRoot()
  ],
  exports:[
    ReactiveFormsModule
  ]
})
export class UserIdsModule { }
