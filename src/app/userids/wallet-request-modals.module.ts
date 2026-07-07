import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DepositeCoinsRequestComponent } from './deposite-coins-request/deposite-coins-request.component';
import { WithdrawCoinsRequestComponent } from './withdraw-coins-request/withdraw-coins-request.component';

@NgModule({
  declarations: [DepositeCoinsRequestComponent, WithdrawCoinsRequestComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalModule],
  exports: [DepositeCoinsRequestComponent, WithdrawCoinsRequestComponent],
})
export class WalletRequestModalsModule {}
