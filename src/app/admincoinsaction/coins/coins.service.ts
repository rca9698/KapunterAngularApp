import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DepositeCoinsByUserIdComponent } from './admin_deposite_coins_by_user_id/admin-deposite-coins-by-user-id.component';
import { WithdrawCoinsUserIdComponent } from './withdraw_coins_user_id/withdraw-coins-user-id.component';
import { environment } from 'src/environments/environment';
import { Ideposit_withdraw_coins_request } from 'src/app/Shared/Modals/Coins/deposit_withdraw_coins_request';
import { WithdrawCoinsRequestComponent } from '../../userids/withdraw-coins-request/withdraw-coins-request.component';
import { apiService } from 'src/app/api.service';
import { DepositeCoinsRequestComponent } from '../../userids/deposite-coins-request/deposite-coins-request.component';
import { AdminWithdrawCoinsByRequestIdComponent } from './admin_withdraw_coins_by_request_id/admin-withdraw-coins-by-request-id.component';
import { AdminDepositeCoinsByRequestIdComponent } from './admin_deposite_coins_by_request_id/admin-deposite-coins-by-request-id.component';
import { AdminDepositeCoinsToIdRequestIdComponent } from './admin_deposite_withdraw_coins_ids_by_request_id/admin-deposite-coins-to-id-request-id.component';
import { AdminWithdrawCoinsToIdRequestIdComponent } from './admin_withdraw_coins_to_id_request_id/admin-withdraw-coins-to-id-request-id.component';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { ViewAdminBankDetailsComponent } from './view_admin_bank_details/view-admin-bank-details.component';

@Injectable({
  providedIn: 'root'
})
export class CoinsService {
  bsmodalRef?: BsModalRef;
  constructor(private bsModalService:BsModalService, private http: HttpClient
    , private apiservice: apiService) { }
  
  OpenDepositeCoinsRequestPopup(title: string, site: ISiteDetailModal){
    const initalstate: ModalOptions = {
      initialState:{
        title,
        site
      }
    }
    this.bsmodalRef = this.bsModalService.show(DepositeCoinsRequestComponent, initalstate);
  }

  OpenWithdrawCoinsRequestPopup(title: string, site: ISiteDetailModal){
    const initalstate: ModalOptions = {
      initialState:{
        title,
        site
      }
    }
    this.bsmodalRef = this.bsModalService.show(WithdrawCoinsRequestComponent, initalstate);
  }

  OpenDepositeCoinsByUserIdPopup(userNumber: string){
    const initalstate: ModalOptions = {
      initialState:{
        userNumber,
      }
    }
    this.bsmodalRef = this.bsModalService.show(DepositeCoinsByUserIdComponent, initalstate);
  }

  OpenWithdrawCoinsUserIdPopup(userNumber: string){
    const initalstate: ModalOptions = {
      initialState:{
        userNumber,
      }
    }
    this.bsmodalRef = this.bsModalService.show(WithdrawCoinsUserIdComponent, initalstate);
  }

  OpenAdminDepositeCoinsByUserIdPopup(obj: any){
    const initalstate: ModalOptions = {
      initialState:{
        obj,
      }
    }
    this.bsmodalRef = this.bsModalService.show(AdminDepositeCoinsByRequestIdComponent, initalstate);
  }

  OpenAdminWithdrawCoinsUserIdPopup(obj: any){
    const initalstate: ModalOptions = {
      initialState:{
        obj,
      }
    }
    this.bsmodalRef = this.bsModalService.show(AdminWithdrawCoinsByRequestIdComponent, initalstate);
  }

  OpenAdminWithdrawCoinsByRequestIdPopup(obj: any){
    const initalstate: ModalOptions = {
      initialState:{
        obj,
      }
    }
    this.bsmodalRef = this.bsModalService.show(AdminWithdrawCoinsByRequestIdComponent, initalstate);
  }

  OpenAdminDepositCoinsByRequestIdPopup(obj: any){
    const initalstate: ModalOptions = {
      initialState:{
        obj,
      }
    }
    this.bsmodalRef = this.bsModalService.show(AdminDepositeCoinsByRequestIdComponent, initalstate);
  }

  OpenAdminDepositeCoinsToIdRequestIdPopup(obj: any){
    const initalstate: ModalOptions = {
      initialState:{
        obj,
      }
    }
    this.bsmodalRef = this.bsModalService.show(AdminDepositeCoinsToIdRequestIdComponent, initalstate);
  }

  OpenAdminWithdrawCoinsToIdRequestIdPopup(obj: any){
    const initalstate: ModalOptions = {
      initialState:{
        obj,
      }
    }
    this.bsmodalRef = this.bsModalService.show(AdminWithdrawCoinsToIdRequestIdComponent, initalstate);
  }

  OpenViewAccountDetailsPopup(obj: any){
    const initalstate: ModalOptions = {
      initialState:{
        obj,
      }
    }
    this.bsmodalRef = this.bsModalService.show(ViewAdminBankDetailsComponent, initalstate);
  }

  deposit_list(obj: Ideposit_withdraw_coins_request){
    return this.apiservice.GetDepositeCoinsRequestList(obj);
  }

  withdraw_list(obj: Ideposit_withdraw_coins_request){
    return this.apiservice.GetWithdrawCoinsRequestList(obj);
  }

  deposit_to_site_list(coinType: number, sessionUser: bigint){
    return this.apiservice.GetDepositeCoinstoSiteRequestList(coinType, sessionUser);
  }

  withdraw_from_site_list(coinType: number, sessionUser: bigint){
    return this.apiservice.GetWithdrawCoinstoSiteRequestList(coinType, sessionUser);
  }

  deposite_coin_request_insert(obj: any){
    return this.apiservice.DepositeCoinRequestInsert(obj);
  }
  
  withdraw_coin_request_insert(obj: any){
    return this.apiservice.WithdrawCoinRequestInsert(obj);
  }

  withdraw_coin_from_site_request_insert(obj: any){
    return this.apiservice.WithdrawCoinFromSiteRequestInsert(obj);
  }

  add_coin_to_site_request_insert(obj: any){
    return this.apiservice.AddCoinToSiteRequestInsert(obj);
  }

  set_default_bank_account(sessionUser: bigint, bankDetailID: bigint){
    return this.apiservice.SetDefaultBankAccount(sessionUser, bankDetailID);
  }

  get_bank_accounts(obj: any){
    return this.apiservice.GetBankAccounts(obj);
  }

  get_bank_account_by_id(bankId: bigint){
    return this.apiservice.GetBankAccountById(bankId);
  }

  get_bank_UPI_details(){
    return this.apiservice.GetBankUPIDetails();
  }

  withdraw_coins_by_request_id(obj: any){
    return this.apiservice.DeleteCoinsFromWallet(obj);
  }

  deposite_coins_by_request_id(obj: any){
    return this.apiservice.UpdateCoinsToWallet(obj);
  }

  deposite_withdraw_coins_to_ids_request_insert(obj: any){
    return this.apiservice.UpdateCoinsToIdRequest(obj);
  }

  deposite_withdraw_coins_to_ids(obj: any){
    return this.apiservice.UpdateCoinsToId(obj);
  } 
}
