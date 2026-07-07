import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CoinsModule } from './coins/coins.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    HttpClientModule,
    ModalModule.forRoot()
  ],
  exports: [RouterModule]
})
export class AdminModule { }
