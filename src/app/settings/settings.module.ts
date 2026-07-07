import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingListsComponent } from './setting-lists/setting-lists.component';
import { OffersComponent } from './offers/offers.component';
import { TermsComponent } from './terms/terms.component';
import { SettingsRoutingModule } from './settings-routing.module';



@NgModule({
  declarations: [
    SettingListsComponent,
    OffersComponent,
    TermsComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
