import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { UserIdsService } from '../user-ids.service';
import { AuthService } from 'src/app/auth.service';
import { Iupdate_coins_to_ids_request_modal, update_coins_to_ids_request_modal } from 'src/app/Shared/Modals/Coins/update_coins_to_ids_request_modal';
import { tap } from 'rxjs';
import { CommonService } from 'src/app/common.service';

@Component({
  selector: 'app-deposite-coins-to-ids',
  templateUrl: './deposite-coins-to-ids.component.html',
  styleUrls: ['./deposite-coins-to-ids.component.css']
})
export class DepositeCoinsToIdsComponent {
  obj: any;
  
  returnType: any;
  returnValue: any;
  returnStatus: any;
  _sessionUser: bigint;

  DepositCoinsToIdsForm: FormGroup;
  submitted : boolean = false;
  updateCoinsToIds : Iupdate_coins_to_ids_request_modal = new update_coins_to_ids_request_modal();

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private useridsservice: UserIdsService, 
    private toasterService: ToastrService, public authservice: AuthService, 
    private commonservice: CommonService){
      this.DepositCoinsToIdsForm = this.formBuilder.group({
        coins: ['', [Validators.required]]
       },
     )
     this._sessionUser = this.authservice.user.userId;
  }

  SendDepositCoinsToIds(){
    this.submitted = true;
    if(this.DepositCoinsToIdsForm.invalid) {
      return;
    }
    this.updateCoinsToIds.coinType = 0;
    this.updateCoinsToIds.coins = this.DepositCoinsToIdsForm.value["coins"];
    this.updateCoinsToIds.accountId = this.obj.accountId;
    this.updateCoinsToIds.sessionUser = this._sessionUser;
    this.updateCoinsToIds.siteId = this.obj.siteId;
    this.updateCoinsToIds.userId = this._sessionUser;
     
    console.log(this.updateCoinsToIds);

   this.useridsservice.Update_Coins_To_Id_Request(this.updateCoinsToIds).subscribe({
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
