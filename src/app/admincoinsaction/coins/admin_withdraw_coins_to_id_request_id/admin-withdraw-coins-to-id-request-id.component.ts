import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/auth.service';
import { admin_deposite_withdraw_coins_ids_by_request_id, Iadmin_deposite_withdraw_coins_ids_by_request_id } from 'src/app/Shared/Modals/Coins/admin_deposite_withdraw_coins_ids_by_request_id';
import { CoinsService } from '../coins.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/common.service';
import { resolveAccountId } from '../coins-request.util';

@Component({
  selector: 'app-admin-withdraw-coins-to-id-request-id',
  templateUrl: './admin-withdraw-coins-to-id-request-id.component.html',
  styleUrls: ['./admin-withdraw-coins-to-id-request-id.component.css']
})
export class AdminWithdrawCoinsToIdRequestIdComponent {
  obj: any;
  
  sitePath: string;
  withdrawCoinsfromidsFrom: FormGroup;
  submitted = false;
  _sessionUser: bigint;
  returnType: any;
  withdrawobj: Iadmin_deposite_withdraw_coins_ids_by_request_id 
      = new admin_deposite_withdraw_coins_ids_by_request_id();

  constructor(public bsModalRef:BsModalRef, private formBuilder: FormBuilder,
    private router:Router, public authservice: AuthService
    , private coinsService: CoinsService, private toasterService: ToastrService
    , private commonservice: CommonService){
      this.withdrawCoinsfromidsFrom = this.formBuilder.group({
        coins: ['', [Validators.required]]
       },
     )
     this.sitePath = environment.imagePath.sitePath;
     this._sessionUser = authservice.user.userId;
 }

 WithdrawCoinsToIds() {
  this.submitted = true;
  if (this.withdrawCoinsfromidsFrom?.invalid) {
    return;
  } 
  this.withdrawobj.userId = this.obj.userId;
  this.withdrawobj.siteId = this.obj.siteId;
  this.withdrawobj.accountId = resolveAccountId(this.obj);
  this.withdrawobj.sessionUser = this._sessionUser;
  this.withdrawobj.coins = this.obj.coins;
  this.withdrawobj.coinType = this.obj.coinType ?? 1;
  this.withdrawobj.coinsRequestId = this.obj.coinsRequestId;
  console.log(this.withdrawobj);
  this.coinsService.deposite_withdraw_coins_to_ids(this.withdrawobj).subscribe(resp => {
    this.returnType = resp;
    this.commonservice.toastrMessages(this.returnType);
  })
 }
}
