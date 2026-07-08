import { Component, OnInit } from '@angular/core';
import { Icoins_request_model } from 'src/app/Shared/Modals/Coins/coins_request_model';
import { CoinsService } from '../coins.service';
import { Ideposit_withdraw_coins_request, deposit_withdraw_coins_request } from 'src/app/Shared/Modals/Coins/deposit_withdraw_coins_request';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { GetUserBankAccount } from 'src/app/Shared/Modals/BankAccount/get_user_bank_account';
import { resolveBankId } from '../coins-request.util';

@Component({
  selector: 'app-withdraw-list',
  templateUrl: './withdraw-list.component.html',
  styleUrls: ['./withdraw-list.component.css', '../coins-listing.shared.css']
})
export class WithdrawListComponent implements OnInit {
  requestList: Icoins_request_model[] | undefined;
  returnType: any;
  paginationCount: number = 1;
  totalCount: number = 0;
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
    this.withdraw_list();
  }

  withdrawcoinsPopup(obj: Icoins_request_model) {
    this.coinsservice.OpenAdminWithdrawCoinsByRequestIdPopup(obj);
  }

  deletewithdrawcoinsPopup(obj: Icoins_request_model) {
    this.deleteservice.OpenDeletePopup('withdrawwalletrequest', 'Delete withdraw request', obj);
  }

  ViewAccountDetails(obj: Icoins_request_model) {
    const bankId = resolveBankId(obj as unknown as Record<string, unknown>);
    if (bankId > 0n) {
      this.coinsservice.get_bank_account_by_id(bankId).subscribe(resp => {
        this.returnType = resp;
        if (this.returnType['returnStatus'] == 1) {
          this.coinsservice.OpenViewAccountDetailsPopup(this.returnType['returnVal'] as Ibank_details);
        } else {
          this.toasterService.warning(this.returnType.returnMessage);
        }
      });
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

  withdraw_list() {
    const obj: Ideposit_withdraw_coins_request = new deposit_withdraw_coins_request();
    obj.coinType = 0;
    obj.userId = this._sessionUser;
    obj.sessionUser = this._sessionUser;
    this.coinsservice.withdraw_list(obj).subscribe(resp => {
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

  PaginationNumber(pageNumber: number) {}

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
