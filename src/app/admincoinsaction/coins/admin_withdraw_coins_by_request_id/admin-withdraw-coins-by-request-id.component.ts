import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { CoinsService } from '../coins.service';
import { Iadmin_withdraw_coins_by_request_id, admin_withdraw_coins_by_request_id } from 'src/app/Shared/Modals/Coins/admin_withdraw_coins_by_request_id';
import { AuthService } from 'src/app/auth.service';
import { CommonService } from 'src/app/common.service';

@Component({
  selector: 'app-admin-withdraw-coins-by-request-id',
  templateUrl: './admin-withdraw-coins-by-request-id.component.html',
  styleUrls: ['./admin-withdraw-coins-by-request-id.component.css']
})
export class AdminWithdrawCoinsByRequestIdComponent {
  obj: any;

   WithdrawCoinsByRequestIDFrom: FormGroup;
   submitted : boolean = false;
   file: File | null = null;
   selectedFileName: string | null = null;
   isupdate: boolean = false;
   withdrawobj: Iadmin_withdraw_coins_by_request_id 
   = new admin_withdraw_coins_by_request_id();
   returnType: any;
   _sessionUser: bigint;
  
   @ViewChild('imageInput') fileInput: any

  processFile(imageInput: HTMLInputElement) {
    const f = imageInput.files?.[0];
    this.file = f ?? null;
    this.selectedFileName = f?.name ?? null;
  }

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private coinsService: CoinsService, 
    private toasterService: ToastrService, public authservice: AuthService
  , private commonservice: CommonService){
      this.WithdrawCoinsByRequestIDFrom = this.formBuilder.group({
        coins: ['', [Validators.required]],
       },
     )
     this._sessionUser = authservice.userdetail.userId;
  }
  ngOnInit(): void {
    
  }

  withdraw_coins_by_request_id(){
    this.submitted = true;
    
  if(this.WithdrawCoinsByRequestIDFrom.invalid || !this.file) {
    return;
  }

  let formParams = new FormData();
  formParams.append('File', this.file);
  formParams.append('coinsRequestId',  this.obj.coinsRequestId?.toString());
  formParams.append('userId', this.obj.userId?.toString());
  formParams.append('coins', this.obj.coins.toString());
  formParams.append('coinType', this.obj.coinType.toString());
  formParams.append('sessionUser', this._sessionUser.toString());

    this.coinsService.withdraw_coins_by_request_id(formParams).subscribe(resp => {
      console.log(resp);
      this.returnType = resp;
      this.commonservice.toastrMessages(this.returnType);
    })
  }
}
