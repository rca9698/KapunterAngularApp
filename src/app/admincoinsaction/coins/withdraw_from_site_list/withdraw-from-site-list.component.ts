import { Component, OnInit } from '@angular/core';
import { CoinsService } from '../coins.service';
import { Icoins_to_site_request_listing_modal } from 'src/app/Shared/Modals/Coins/coins_to_site_request_listing_modal';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';

@Component({
  selector: 'app-withdraw-from-site-list',
  templateUrl: './withdraw-from-site-list.component.html',
  styleUrls: ['./withdraw-from-site-list.component.css']
})
export class WithdrawFromSiteListComponent implements OnInit {
  requestList: Icoins_to_site_request_listing_modal[] | undefined;  
  returnType:any;
  paginationCount: number = 1;
  totalCount: number = 0;
  private readonly _sessionUser: bigint;
  
  constructor(private coinsservice:CoinsService, private authservice: AuthService
    ,private toasterService:ToastrService
  ){
    this._sessionUser = this.authservice.user.userId;
   }
  ngOnInit(): void {
    this.withdraw_from_site_list();
  }

  withdraw_from_site_list(){
    this.coinsservice.withdraw_from_site_list(0, this._sessionUser).subscribe(resp => {
      this.returnType = resp;
      if(this.returnType['returnStatus'] == 1){
        this.requestList = this.returnType['returnList'];
      }else{
        this.toasterService.warning(this.returnType.returnMessage);
      }
    });
  }

  withdrawcoinsfromsitePopup(obj: Icoins_to_site_request_listing_modal){
    this.coinsservice.OpenAdminWithdrawCoinsToIdRequestIdPopup(obj);
  }

  deletewithdrawcoinsfromsitePopup(obj: Icoins_to_site_request_listing_modal){

  }

  PaginationNumber(pageNumber:number) { 

  }

  //function to return list of numbers from 0 to n-1 
  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
