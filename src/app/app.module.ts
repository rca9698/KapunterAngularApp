import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Accounts/login/login.component';
import { RegisterComponent } from './Accounts/register/register.component';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccountsModule } from './Accounts/accounts.module';
import { NotFoundComponent } from './Shared/component/error/not-found/not-found.component';
import { ValidationMessageComponent } from './Shared/component/error/validation-message/validation-message.component';
import { SitesModule } from './Sites/sites.module';
import { AppToasterComponent } from './toastr/toastrs/app-toaster.component';
import { FormsModule } from '@angular/forms';
import { AddImageComponent } from './Dashboard/Add-Image/add-image.component';
import { AuthInterceptorProvider } from './auth-interceptor.service';
import { DeleteModuleComponent } from './Shared/Modules/delete-module/delete-module.component';
import { MakeDefaultModuleComponent } from './Shared/Modules/make-default-module/make-default-module.component';
import { UserIdsModule } from './userids/user-ids.module';
import { CoinsModule } from './admincoinsaction/coins/coins.module';
import { ViewImageModuleComponent } from './Shared/Modules/view-image-module/view-image-module.component';
import { WhatsappFloatComponent } from './Shared/component/whatsapp-float/whatsapp-float.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    FooterComponent,
    NavbarComponent,
    HomeComponent,
    NotFoundComponent,
    ValidationMessageComponent,
    AppToasterComponent,
    AddImageComponent,
    DeleteModuleComponent,
    MakeDefaultModuleComponent,
    ViewImageModuleComponent,
    WhatsappFloatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AccountsModule,
    SitesModule,
    UserIdsModule,
    CoinsModule,
    FormsModule
  ],
  providers: [AuthInterceptorProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
