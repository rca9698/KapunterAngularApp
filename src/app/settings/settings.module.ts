import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingListsComponent } from './setting-lists/setting-lists.component';
import { OffersComponent } from './offers/offers.component';
import { TermsComponent } from './terms/terms.component';
import { BonusComponent } from './bonus/bonus.component';
import { LossbackComponent } from './lossback/lossback.component';
import { RulesComponent } from './rules/rules.component';
import { SettingsRoutingModule } from './settings-routing.module';

@NgModule({
  declarations: [
    SettingListsComponent,
    OffersComponent,
    TermsComponent,
    BonusComponent,
    LossbackComponent,
    RulesComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
