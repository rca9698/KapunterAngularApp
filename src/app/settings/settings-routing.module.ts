import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule, Routes } from '@angular/router';
import { SettingListsComponent } from './setting-lists/setting-lists.component';
import { OffersComponent } from './offers/offers.component';
import { TermsComponent } from './terms/terms.component';

const routes : Routes = [
  { path: 'setting-lists', component: SettingListsComponent },
  { path: 'offers', component: OffersComponent },
  { path: 'terms', component: TermsComponent }
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
