import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { ListImagesComponent } from './ListImages/list-images.component';
import { DeletImageComponent } from './delet-image/delet-image.component';
import { SingleClickModule } from '../Shared/single-click/single-click.module';



@NgModule({
  declarations: [
    ListImagesComponent,
    DeletImageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    HttpClientModule,
    ModalModule.forRoot(),
    SingleClickModule
  ],
  exports:[
    ReactiveFormsModule
  ]
})
export class DashboardModule { }
