import { Component, OnInit } from '@angular/core';
import { CoinsService } from '../coins.service';
import { Icoins_to_site_request_listing_modal } from 'src/app/Shared/Modals/Coins/coins_to_site_request_listing_modal';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { GetUserBankAccount } from 'src/app/Shared/Modals/BankAccount/get_user_bank_account';
import { environment } from 'src/environments/environment';
import { hasBankId, resolveAccountId, resolveBankId } from '../coins-request.util';

@Component({
  selector: 'app-withdraw-from-site-list',
  templateUrl: './withdraw-from-site-list.component.html',
  styleUrls: ['./withdraw-from-site-list.component.css', '../coins-listing.shared.css']
})
export class WithdrawFromSiteListComponent implements OnInit {
  requestList: Icoins_to_site_request_listing_modal[] | undefined;
  bankdetails: Ibank_details | undefined;
  returnType: any;
  paginationCount: number = 1;
  totalCount: number = 0;
  sitePath = environment.imagePath.sitePath;
  private readonly _sessionUser: bigint;

  constructor(
    private coinsservice: CoinsService,
    private authservice: AuthService,
    private toasterService: ToastrService,
    private deleteservice: DeleteService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.withdraw_from_site_list();
  }

  withdraw_from_site_list() {
    // Previous listing call: GET /api/Coin/GetCoinsToAccountRequest/{coinType}/{sessionUser}
    this.coinsservice.withdraw_from_site_list(0, this._sessionUser).subscribe(resp => {
      this.returnType = resp;
      if (this.returnType['returnStatus'] == 1) {
        this.requestList = this.returnType['returnList'];
        if (this.requestList?.length) {
          this.paginationCount = this.requestList[0].paginationCount || 1;
          this.totalCount = this.requestList[0].totalCount || this.requestList.length;
        }
      } else {
        this.toasterService.warning(this.returnType.returnMessage);
      }
    });
  }

  getAccountId(request: Icoins_to_site_request_listing_modal): string {
    return String(resolveAccountId(request as unknown as Record<string, unknown>));
  }

  getAccountLabel(request: Icoins_to_site_request_listing_modal): string {
    return request.accountUserName || request.userName || this.getAccountId(request);
  }

  ViewAccountDetails(obj: Icoins_to_site_request_listing_modal) {
    const bankId = resolveBankId(obj as unknown as Record<string, unknown>);
    if (bankId > 0n) {
      this.loadBankAccountById(bankId);
      return;
    }

    const bankObj = new GetUserBankAccount(obj.userId, this._sessionUser, 1);
    this.coinsservice.get_bank_accounts(bankObj).subscribe(resp => {
      this.returnType = resp;
      if (this.returnType['returnStatus'] == 1) {
        const accounts: Ibank_details[] = this.returnType['returnList'] || [];
        const defaultAccount = accounts.find(a => a.isDefault === '1' || a.isDefault === 'true') || accounts[0];
        if (defaultAccount) {
          this.coinsservice.OpenViewAccountDetailsPopup(defaultAccount);
        } else {
          this.toasterService.warning('No bank account found for this user.');
        }
      } else {
        this.toasterService.warning(this.returnType.returnMessage || 'Unable to load bank accounts.');
      }
    });
  }

  private loadBankAccountById(bankId: bigint) {
    this.coinsservice.get_bank_account_by_id(bankId).subscribe(resp => {
      this.returnType = resp;
      if (this.returnType['returnStatus'] == 1) {
        this.bankdetails = this.returnType['returnVal'];
        this.coinsservice.OpenViewAccountDetailsPopup(this.bankdetails);
      } else {
        this.toasterService.warning(this.returnType.returnMessage);
      }
    });
  }

  withdrawcoinsfromsitePopup(obj: Icoins_to_site_request_listing_modal) {
    this.coinsservice.OpenAdminWithdrawCoinsToIdRequestIdPopup(obj);
  }

  deletewithdrawcoinsfromsitePopup(obj: Icoins_to_site_request_listing_modal) {
    this.deleteservice.OpenDeletePopup('withdrawfromidrequest', 'Delete withdraw request', obj);
  }

  canViewBankDetails(request: Icoins_to_site_request_listing_modal): boolean {
    return hasBankId(request as unknown as Record<string, unknown>) || !!request.userId;
  }

  PaginationNumber(pageNumber: number) {}

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
