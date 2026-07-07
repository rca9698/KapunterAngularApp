import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListImagesComponent } from './ListImages/list-images.component';


const routes : Routes = [
  { path: 'list-images', component: ListImagesComponent}
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class DashboardRoutingModule { }
