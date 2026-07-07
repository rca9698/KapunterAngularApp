import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { CoinsService } from '../../admincoinsaction/coins/coins.service';
import { Ibank_details, bank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { Iwithdrawcoinrequestmodal, withdrawcoinrequestmodal } from 'src/app/Shared/Modals/Coins/withdraw_coin_request_modal';
import { AuthService } from 'src/app/auth.service';
import { GetUserBankAccount } from 'src/app/Shared/Modals/BankAccount/get_user_bank_account'
import { CommonService } from 'src/app/common.service';

@Component({
  selector: 'app-withdraw-coins-request',
  templateUrl: './withdraw-coins-request.component.html',
  styleUrls: ['./withdraw-coins-request.component.css']
})
export class WithdrawCoinsRequestComponent {

  banks: Ibank_details[] = [];
  _sessionUser: bigint;
   withdrawCoinRequestFrom: FormGroup;
   submitted : boolean = false;
   file: any = null;
   returnType: any;
   bankdetails: Ibank_details;
   withdrawcoinrequestmodalobj: Iwithdrawcoinrequestmodal = new withdrawcoinrequestmodal();

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private coinsservice: CoinsService, 
    private toasterService: ToastrService, public authservice: AuthService,
    private commonService: CommonService) {
      this._sessionUser = authservice.user.userId;
      const bankobj = new GetUserBankAccount(this.authservice.user.userId, this.authservice.user.userId
        , 1);
      this.GetBankAccounts(bankobj);
      this.withdrawCoinRequestFrom = this.formBuilder.group({
        coins: ['', [Validators.required]],
        bankDropdown: ['', [Validators.required]]
       },
     )
     this.bankdetails = new bank_details();
  }

  withdrawCoinRequest(){ 
    this.submitted = true;

    if(this.withdrawCoinRequestFrom.invalid) {
      return;
    }
    
    this.withdrawcoinrequestmodalobj.coins = this.withdrawCoinRequestFrom.value["coins"];
    this.withdrawcoinrequestmodalobj.bankId = this.withdrawCoinRequestFrom.value["bankDropdown"];
    this.withdrawcoinrequestmodalobj.sessionUser = this.authservice.user.userId;
    this.withdrawcoinrequestmodalobj.userId = this.authservice.user.userId;
    this.withdrawcoinrequestmodalobj.accountid = this.authservice.user.userId;
    this.coinsservice.withdraw_coin_from_site_request_insert(this.withdrawcoinrequestmodalobj).subscribe({
      next:(response) => {
        this.returnType = response;
        this.commonService.toastrMessages(this.returnType);
      },
      error:error=>{
        console.log(error);
      }
    });
  }

  ChangeWithDrawBank(event: any){
    const bankId = event.target.value as unknown as bigint;
    this.coinsservice.set_default_bank_account
    (this._sessionUser, bankId).subscribe({
      next:(response) => {
        this.GetBankAccountsById(bankId);
      },
      error:error=>{
        console.log(error);
      }
    });
  }

  GetBankAccounts(obj: any){
    this.coinsservice.get_bank_accounts(obj).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.banks = this.returnType['returnList'];
      },
      error:error => {
        console.log(error);
      }
    });
  }

  GetBankAccountsById(bankId: bigint){
    this.coinsservice.get_bank_account_by_id(bankId).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.bankdetails = this.returnType['returnVal'];
      },
      error:error => {
        console.log(error);
      }
    });
  }

}
