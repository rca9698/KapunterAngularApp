import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddImageComponent } from './Dashboard/Add-Image/add-image.component';
import { AuthInterceptorProvider } from './auth-interceptor.service';
import { LoaderInterceptorProvider } from './Shared/loader/loader.interceptor';
import { LoaderModule } from './Shared/loader/loader.module';
import { SingleClickActivityInterceptorProvider } from './Shared/single-click/single-click-activity.interceptor';
import { SingleClickModule } from './Shared/single-click/single-click.module';
import { NativeFormDataInterceptorProvider } from './Shared/platform/native-formdata.interceptor';
import { DeleteModuleComponent } from './Shared/Modules/delete-module/delete-module.component';
import { MakeDefaultModuleComponent } from './Shared/Modules/make-default-module/make-default-module.component';
import { ViewImageModuleComponent } from './Shared/Modules/view-image-module/view-image-module.component';
import { WhatsappFloatComponent } from './Shared/component/whatsapp-float/whatsapp-float.component';
import { PassbookActivityToastComponent } from './Shared/passbook-activity-toast/passbook-activity-toast.component';
import { RequestTrackerPanelComponent } from './Shared/request-tracker/request-tracker-panel.component';
import { AppConfigService, appConfigInitializer } from './app-config.service';
import { BrandModule } from './Shared/brand/brand.module';

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
    PassbookActivityToastComponent,
    RequestTrackerPanelComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AccountsModule,
    SitesModule,
    LoaderModule,
    SingleClickModule,
    BrandModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthInterceptorProvider,
    SingleClickActivityInterceptorProvider,
    LoaderInterceptorProvider,
    // Must stay after auth so Authorization is present; short-circuits FormData on native.
    NativeFormDataInterceptorProvider,
    {
      provide: APP_INITIALIZER,
      useFactory: appConfigInitializer,
      deps: [AppConfigService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
