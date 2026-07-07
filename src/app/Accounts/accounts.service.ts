import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { LoginComponent } from './login/login.component';
import { login } from '../Shared/Modals/login';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { apiService } from '../api.service';
@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  bsmodalRef?: BsModalRef;
  
  constructor(private bsModalService:BsModalService,private http: HttpClient
    , private apiservice:apiService) { }

OpenLoginPopup(issuccess: boolean, title: string){
  const initalstate: ModalOptions = {
    initialState:{
      issuccess,
      title
    }
  }

  this.bsmodalRef = this.bsModalService.show(LoginComponent,initalstate);
}

sendOtp(mobileNumber: string){
  return this.apiservice.sendOtp(mobileNumber);
  }

  sendOtpService(url: string){
    return this.apiservice.sendOtpService(url);
    }

login(model: login){ 
  return this.apiservice.login(model);
}
 
}
