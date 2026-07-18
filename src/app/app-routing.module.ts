import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './Shared/component/error/not-found/not-found.component';
import { ValidationMessageComponent } from './Shared/component/error/validation-message/validation-message.component';
import { IsAuthenticatedGuard } from './is-authenticated.guard';
import { HasRoleGuard } from './has-role.guard';
import { WhatsappLinksComponent } from './whatsapp-links/whatsapp-links.component';

const routes: Routes = [
  {path:"", component:HomeComponent}, //, canActivate: [IsAuthenticatedGuard]
  {path:"contact", component:WhatsappLinksComponent},
  
  //import lazy loading by following formatclear
  {path:"account", loadChildren: () => import('./Accounts/accounts.module').then(module => module.AccountsModule)
    , canActivate: [IsAuthenticatedGuard]
  },
  {path:"adminaction", loadChildren: () => import('./admincoinsaction/admin.module').then(module => module.AdminModule)
    , canActivate: [IsAuthenticatedGuard, HasRoleGuard], 
    data:{
      role: 'admin'
    }
  },
  {path:"site", loadChildren: () => import('./Sites/sites.module').then(module => module.SitesModule), canActivate: [IsAuthenticatedGuard] },
  {path:"passbook", loadChildren: () => import('./Passbook/passbook.module').then(module => module.PassbookModule), canActivate: [IsAuthenticatedGuard] },
  {path:"bankAccount", loadChildren: () => import('./BankAccount/bank-account.module').then(module => module.BankAccountModule), canActivate: [IsAuthenticatedGuard] },
  {path:"dashboard", loadChildren: () => import('./Dashboard/dashboard.module').then(module => module.DashboardModule), canActivate: [IsAuthenticatedGuard] },
  {path:"setting", loadChildren: () => import('./settings/settings.module').then(module => module.SettingsModule), canActivate: [IsAuthenticatedGuard] },
  {path:"notification", loadChildren: () => import('./notification/notification.module').then(module=>module.NotificationModule), canActivate: [IsAuthenticatedGuard] },
  {path:"ids", loadChildren: () => import('./admincoinsaction/Ids/ids.module').then(module=>module.IdsModule), canActivate: [IsAuthenticatedGuard] },
  {path:"userids", loadChildren: () => import('./userids/user-ids.module').then(module=>module.UserIdsModule), canActivate: [IsAuthenticatedGuard] },

  {path:"not-found", component:NotFoundComponent},
  {path:"**", redirectTo: 'not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
