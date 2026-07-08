import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountRoutingModule } from './account-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { CoinsModule } from '../admincoinsaction/coins/coins.module';
import { ProfileDetailsComponent } from './Profile/profile-details/profile-details.component';

@NgModule({
  declarations: [
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
  exports: [
    ReactiveFormsModule
  ]
})
export class AccountsModule { }
