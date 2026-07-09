import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccountRoutingModule } from './account-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { CoinsModule } from '../admincoinsaction/coins/coins.module';
import { ProfileDetailsComponent } from './Profile/profile-details/profile-details.component';
import { ChangePasswordModalComponent } from './Profile/change-password-modal/change-password-modal.component';

@NgModule({
  declarations: [
    ProfileDetailsComponent,
    ChangePasswordModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
