import { Injectable } from '@angular/core';
import { apiService } from '../api.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DepositeCoinsToIdsComponent } from './deposite-coins-to-ids/deposite-coins-to-ids.component';
import { WithdrawCoinsFromIdsComponent } from './withdraw-coins-from-ids/withdraw-coins-from-ids.component';
import { HttpClient } from '@angular/common/http';
import { CreateIdsComponent } from './createid/create-ids.component';

@Injectable({
  providedIn: 'root'
})
export class UserIdsService {
  bsmodalRef?: BsModalRef;
  constructor(private bsModalService:BsModalService,private http: HttpClient
    , private apiservice: apiService) { }
  
  AddIDRequest(obj: any){
    return this.apiservice.AddIDRequest(obj);
  }
  
  OpenAddIDRequestPopup(obj: any){
    const initalstate: ModalOptions = {
      initialState:{
        obj,
      }
    }
    this.bsmodalRef = this.bsModalService.show(CreateIdsComponent, initalstate);
  }

  OpenDepositeCoinsToIDPopup(obj: any){
    const initalstate: ModalOptions = {
      initialState:{
        obj
      }
    }
    this.bsmodalRef = this.bsModalService.show(DepositeCoinsToIdsComponent, initalstate);
  }

  OpenWithdrawCoinsFromIdPopup(obj: any){
    const initalstate: ModalOptions = {
      initialState:{
        obj,
      }
    }
    this.bsmodalRef = this.bsModalService.show(WithdrawCoinsFromIdsComponent, initalstate);
  }

  Update_Coins_To_Id_Request(obj: any){
    return this.apiservice.UpdateCoinsToIdRequest(obj);
  }

  Withdraw_Coins_To_Id_Request(obj: any){
    return this.apiservice.UpdateCoinsToIdRequest(obj);
  }

}
