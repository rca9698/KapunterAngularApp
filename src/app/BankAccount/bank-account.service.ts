import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { delay, Observable, of } from 'rxjs';
import { AddUserBankAccountComponent } from './user_bank_account/add_user_bank_account/add-user-bank-account.component';
import { AddUserUpiComponent } from './user_bank_account/add_user_upi/add-user-upi.component';
import { AddUserQrComponent } from './user_bank_account/add_user_qr/add-user-qr.component';
import { Iadd_bank_account } from '../Shared/Modals/BankAccount/add_bank_account';
import { Iadd_admin_bank_account, add_admin_bank_account } from '../Shared/Modals/BankAccount/add_admin_bank_account';
import { AddAdminBankAccountComponent } from './admin_bank_account/add-admin-bank-account/add-admin-bank-account.component';
import { apiService } from '../api.service';
import { AddAdminUPIComponent } from './admin_bank_account/add-Admin-UPI/add-admin-upi.component';
import { AddAdminQRComponent } from './admin_bank_account/add-admin-QR/add-admin-qr.component';
import { Iadd_user_upi } from '../Shared/Modals/BankAccount/add_user_upi';
import { AdminVendorSitesListComponent } from './admin_bank_account/admin-vendor-sites-list/admin-vendor-sites-list.component';
import { ViewAdminSitePaymentComponent } from './admin_bank_account/view-admin-site-payment/view-admin-site-payment.component';
import { AddAdminSitePaymentComponent } from './admin_bank_account/add-admin-site-payment/add-admin-site-payment.component';
import { ISiteDetailModal } from '../Shared/Modals/site-detail-modal';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {
  bsmodalRef?: BsModalRef;

  // TODO: Replace in-memory dummy stores with real API calls when backend is ready.
  private userUpiDummyStore: any[] = [
    {
      bankAccountDetailID: 1001,
      accountDisplayName: 'Primary UPI',
      upiId: 'kapunter@upi',
      isDefault: '1',
      isActive: 1
    }
  ];

  private userQrDummyStore: any[] = [
    {
      qrId: 2001,
      bankAccountDetailID: 2001,
      accountDisplayName: 'Payment QR',
      qrImageUrl: 'assets/kapunter-logo.jpeg',
      isDefault: '1',
      isActive: 1
    }
  ];

  constructor(private bsModalService:BsModalService,private http: HttpClient, private apiService:apiService
    , private authService: AuthService) { }

OpenUserBankAccountPopup(isupdate: boolean, obj: Iadd_bank_account, redirectAfterSave: boolean = true){
  const initalstate: ModalOptions = {
    initialState:{
      isupdate,
      obj,
      redirectAfterSave
    }
  }
  
  this.bsmodalRef = this.bsModalService.show(AddUserBankAccountComponent, initalstate);
}

OpenUserUpiPopup(redirectAfterSave: boolean = true) {
  const initalstate: ModalOptions = {
    initialState: { redirectAfterSave }
  };
  this.bsmodalRef = this.bsModalService.show(AddUserUpiComponent, initalstate);
}

OpenUserQRPopup(redirectAfterSave: boolean = true) {
  const initalstate: ModalOptions = {
    initialState: { redirectAfterSave }
  };
  this.bsmodalRef = this.bsModalService.show(AddUserQrComponent, initalstate);
}

OpenAddAdminBankAccountPopup(isupdate: boolean, obj: Iadd_admin_bank_account = new add_admin_bank_account(), siteName: string = ''){
  const initalstate: ModalOptions = {
    class: 'modal-dialog-centered admin-pay-modal',
    initialState:{
      isupdate,
      obj,
      siteName
    }
  }
  
  this.bsmodalRef = this.bsModalService.show(AddAdminBankAccountComponent, initalstate);
}

OpenAddAdminUpiPopup(isupdate: boolean, obj: Iadd_admin_bank_account = new add_admin_bank_account(), siteName: string = ''){
  const initalstate: ModalOptions = {
    class: 'modal-dialog-centered admin-pay-modal',
    initialState:{
      isupdate,
      obj,
      siteName
    }
  }
  
  this.bsmodalRef = this.bsModalService.show(AddAdminUPIComponent, initalstate);
}

OpenAddAdminQRPopup(isupdate: boolean, obj: Iadd_admin_bank_account = new add_admin_bank_account(), siteName: string = ''){
  const initalstate: ModalOptions = {
    class: 'modal-dialog-centered admin-pay-modal',
    initialState:{
      isupdate,
      obj,
      siteName
    }
  }
  
  this.bsmodalRef = this.bsModalService.show(AddAdminQRComponent, initalstate);
}

OpenAddAdminSitePaymentPopup(site: ISiteDetailModal): BsModalRef | undefined {
  const initalstate: ModalOptions = {
    class: 'modal-dialog-centered admin-pay-modal admin-pay-modal-wide',
    initialState: { site }
  };
  this.bsmodalRef = this.bsModalService.show(AddAdminSitePaymentComponent, initalstate);
  return this.bsmodalRef;
}

OpenViewAdminSitePaymentPopup(site: ISiteDetailModal): BsModalRef | undefined {
  const initalstate: ModalOptions = {
    class: 'modal-dialog-centered admin-pay-modal admin-pay-modal-xl',
    initialState: { site }
  };
  this.bsmodalRef = this.bsModalService.show(ViewAdminSitePaymentComponent, initalstate);
  return this.bsmodalRef;
}

list_User_Bank_Accounts(obj: any){
  return this.apiService.GetBankAccounts(obj);
}

Add_Bank_Account(obj: any){
  return this.apiService.AddBankAccount(obj);
}



list_Admin_Bank_Accounts(siteId: number | string){
  return this.apiService.AdminBankAccounts(siteId);
}

list_admin_upi_accounts(siteId: number | string){
  return this.apiService.GetAdminUpiAccounts(siteId);
}

list_User_Upi_Accounts(){
    return this.apiService.GetUserUpiAccounts({ userId: this.authService.user.userId });
}

list_admin_QR_accounts(siteId: number | string){
  return this.apiService.GetAdminQRCode(siteId);
}

list_User_QR_Accounts(){
  return this.apiService.GetUserQRCode(Number(this.authService.user.userId));
}

Add_Admin_Bank_Account(obj: any){
  return this.apiService.AddUpdateAdminBankAccount(obj);
}

add_update_admin_upi(obj: any){
  return this.apiService.AddUpdateAdminUpiAccount(obj);
}

add_admin_qr(obj: any){
  return this.apiService.AddAdminQRCode(obj);
}

Add_User_Upi(obj: any){
  return this.apiService.AddUserUpiAccount(obj);
}

add_User_qr(obj: any){
  console.log(obj);
  return this.apiService.AddUserQRCode(obj);
}

Delete_User_Upi(upiId: bigint | number) {
  return this.apiService.DeleteUserUpiAccount(this.buildUserPaymentParams({ upiId }));
}

Delete_User_QR(qrId: bigint | number) {
  return this.apiService.DeleteUserQRCode(this.buildUserPaymentParams({ qrId }));
}

Set_Default_User_Upi(upiId: bigint | number) {
  return this.apiService.SetDefaultUserUpiAccount(this.buildUserPaymentParams({ upiId }));
}

Set_Default_User_QR(qrId: bigint | number) {
  return this.apiService.SetDefaultUserQr(this.buildUserPaymentParams({ qrId }));
}

private buildUserPaymentParams(extra: Record<string, unknown>) {
  const userId = this.authService.user.userId;
  return { sessionUser: userId, userId, ...extra };
}

}
