import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/auth.service';
import { CoinsService } from '../coins.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { admin_deposite_withdraw_coins_ids_by_request_id, Iadmin_deposite_withdraw_coins_ids_by_request_id } from 'src/app/Shared/Modals/Coins/admin_deposite_withdraw_coins_ids_by_request_id';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/common.service';

@Component({
  selector: 'app-admin-deposite-coins-to-id-request-id',
  templateUrl: './admin-deposite-coins-to-id-request-id.component.html',
  styleUrls: ['./admin-deposite-coins-to-id-request-id.component.css']
})
export class AdminDepositeCoinsToIdRequestIdComponent implements OnInit {
  obj: any;
  
  sitePath: string;
  DepositeCoinsToIdsForm: FormGroup;
  submitted = false;
  _sessionUser: bigint;
  returnType: any;
  depositeobj: Iadmin_deposite_withdraw_coins_ids_by_request_id 
      = new admin_deposite_withdraw_coins_ids_by_request_id();

  constructor(public bsModalRef:BsModalRef, private formBuilder: FormBuilder,
    private router:Router, public authservice: AuthService
    , private coinsService: CoinsService, private toasterService: ToastrService
  , private commonservice: CommonService){
      this.DepositeCoinsToIdsForm = this.formBuilder.group({
        coins: ['', [Validators.required]]
       },
     )
     this.sitePath = environment.imagePath.sitePath;
     this._sessionUser = authservice.user.userId;
     
 }
  ngOnInit(): void {
    console.log(this.obj);
  }

 DepositeCoinsToIds() {
  this.submitted = true;
  
  if (this.DepositeCoinsToIdsForm?.invalid) {
    return;
  } 
  this.depositeobj.userId = this.obj.userId;
  this.depositeobj.siteId = this.obj.siteId;
  this.depositeobj.sessionUser = this._sessionUser;
  this.depositeobj.coins = this.obj.coins;
  this.depositeobj.accountId = this.obj.accountID;
  this.depositeobj.coinType = 0;
  this.depositeobj.coinsRequestId = this.obj.coinsRequestId;
  console.log(this.depositeobj);
  this.coinsService.deposite_withdraw_coins_to_ids(this.depositeobj).subscribe(resp => {
    this.returnType = resp;
    this.commonservice.toastrMessages(this.returnType);
  })
 }
}
