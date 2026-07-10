import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingListsComponent } from './setting-lists/setting-lists.component';
import { OffersComponent } from './offers/offers.component';
import { TermsComponent } from './terms/terms.component';
import { BonusComponent } from './bonus/bonus.component';
import { LossbackComponent } from './lossback/lossback.component';
import { RulesComponent } from './rules/rules.component';

const routes: Routes = [
  { path: 'setting-lists', component: SettingListsComponent },
  { path: 'bonus', component: BonusComponent },
  { path: 'lossback', component: LossbackComponent },
  { path: 'rules', component: RulesComponent },
  { path: 'offers', component: OffersComponent },
  { path: 'terms', component: TermsComponent }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
