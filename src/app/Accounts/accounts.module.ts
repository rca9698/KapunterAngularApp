import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccountRoutingModule } from './account-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { CoinsSharedModule } from '../admincoinsaction/coins/coins-shared.module';
import { ProfileDetailsComponent } from './Profile/profile-details/profile-details.component';
import { ChangePasswordModalComponent } from './Profile/change-password-modal/change-password-modal.component';
import { ReferEarnComponent } from './Profile/refer-earn/refer-earn.component';
import { LoaderModule } from '../Shared/loader/loader.module';
import { SingleClickModule } from '../Shared/single-click/single-click.module';

@NgModule({
  declarations: [
    ProfileDetailsComponent,
    ChangePasswordModalComponent,
    ReferEarnComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AccountRoutingModule,
    HttpClientModule,
    // Modals only — never import CoinsModule here (it owns /adminaction/coins/* routes)
    CoinsSharedModule,
    ModalModule.forRoot(),
    LoaderModule,
    SingleClickModule
  ],
  exports: [
    ReactiveFormsModule
  ]
})
export class AccountsModule { }
