import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPassbookDetailComponent } from './viewPassbookDetail/view-passbook-detail.component';
import { PassbookViewPanelComponent } from './viewPanel/passbook-view-panel.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PassbookRoutingModule } from './passbook-routing.module';

@NgModule({
  declarations: [
    PassbookViewPanelComponent,
    ViewPassbookDetailComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PassbookRoutingModule,
    HttpClientModule,
    ModalModule.forRoot()
  ]
})
export class PassbookModule { }
