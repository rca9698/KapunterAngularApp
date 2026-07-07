import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PassbookViewPanelComponent } from './viewPanel/passbook-view-panel.component';

const routes : Routes = [
  { path: 'passbook-view-panel', component: PassbookViewPanelComponent }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports:[
    RouterModule
  ]
})
export class PassbookRoutingModule { }
