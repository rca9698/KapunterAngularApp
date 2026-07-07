import { Component, OnInit } from '@angular/core';
import { Icoins_request_model } from 'src/app/Shared/Modals/Coins/coins_request_model';
import { CoinsService } from '../coins.service';
import { Ideposit_withdraw_coins_request, deposit_withdraw_coins_request } from 'src/app/Shared/Modals/Coins/deposit_withdraw_coins_request';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';

@Component({
  selector: 'app-withdraw-list',
  templateUrl: './withdraw-list.component.html',
  styleUrls: ['./withdraw-list.component.css']
})
export class WithdrawListComponent implements OnInit {
  requestList: Icoins_request_model[] | undefined;  
  returnType:any;
  paginationCount: number = 1;
  totalCount: number = 0;
  private readonly _sessionUser: bigint;
  
  constructor(private coinsservice:CoinsService, private authservice: AuthService
    , private toasterService: ToastrService
  ){
    this._sessionUser = this.authservice.user.userId;
   }
  ngOnInit(): void {
    this.withdraw_list();
  }
 
  withdrawcoinsPopup(obj: Icoins_request_model){
    this.coinsservice.OpenAdminWithdrawCoinsByRequestIdPopup(obj);
  }

  deletewithdrawcoinsPopup(obj: Icoins_request_model){

  }

  withdraw_list(){
    let obj: Ideposit_withdraw_coins_request 
    = new deposit_withdraw_coins_request();
    obj.coinType = 0;
    obj.userId = this._sessionUser;
    obj.sessionUser = this._sessionUser;
    this.coinsservice.withdraw_list(obj).subscribe(resp => {
      this.returnType = resp;
      if(this.returnType['returnStatus'] == 1){
        this.requestList = this.returnType['returnList'];
      }else{
        this.toasterService.warning(this.returnType.returnMessage);
      }
    });
  }

  PaginationNumber(pageNumber:number) { 

  }

  //function to return list of numbers from 0 to n-1 
  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
