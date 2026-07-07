import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Iadmin_update_coins_to_ids, admin_update_coins_to_ids } from 'src/app/Shared/Modals/Coins/admin_update_coins_to_ids';
import { UserIdsService } from '../user-ids.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { Router } from '@angular/router';
import { Iupdate_coins_to_ids_request_modal, update_coins_to_ids_request_modal } from 'src/app/Shared/Modals/Coins/update_coins_to_ids_request_modal';
import { CommonService } from 'src/app/common.service';

@Component({
  selector: 'app-withdraw-coins-from-ids',
  templateUrl: './withdraw-coins-from-ids.component.html',
  styleUrls: ['./withdraw-coins-from-ids.component.css']
})
export class WithdrawCoinsFromIdsComponent {
  obj: any;

  WithdrawCoinsToIdsForm: FormGroup;
  submitted : boolean = false;
  _sessionUser: bigint;
  withdrawCoinsToIds : Iupdate_coins_to_ids_request_modal = new update_coins_to_ids_request_modal();
  
  returnType: any;
  returnValue: any;
  returnStatus: any;

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private useridsservice: UserIdsService, 
    private toasterService: ToastrService, public authservice: AuthService
    , private commonservice: CommonService){
      this.WithdrawCoinsToIdsForm = this.formBuilder.group({
        coins: ['', [Validators.required]]
       },
     )
     this._sessionUser = authservice.user.userId;
  }

  SendWithdrawCoinsFromIds(){
    this.submitted = true;

    if(this.WithdrawCoinsToIdsForm.invalid) {
      return;
    }

    this.withdrawCoinsToIds.coinType = 1;
    this.withdrawCoinsToIds.coins = this.WithdrawCoinsToIdsForm.value["coins"];
    this.withdrawCoinsToIds.accountId = this.obj.accountId;
    this.withdrawCoinsToIds.sessionUser = this._sessionUser;
    this.withdrawCoinsToIds.siteId = this.obj.siteId;
    this.withdrawCoinsToIds.userId = this._sessionUser;
     
   this.useridsservice.Withdraw_Coins_To_Id_Request(this.withdrawCoinsToIds).subscribe({
    next:(resp) =>{
      this.returnType = resp;
      this.commonservice.toastrMessages(this.returnType);
    },
    error:(error: any) => {
      console.log(error);
    }
  })

  }

}
