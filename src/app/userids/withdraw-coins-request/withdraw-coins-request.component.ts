import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { CoinsService } from '../../admincoinsaction/coins/coins.service';
import { Ibank_details, bank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { Iwithdrawcoinrequestmodal, withdrawcoinrequestmodal } from 'src/app/Shared/Modals/Coins/withdraw_coin_request_modal';
import { AuthService } from 'src/app/auth.service';
import { GetUserBankAccount } from 'src/app/Shared/Modals/BankAccount/get_user_bank_account';
import { CommonService } from 'src/app/common.service';
import { BankAccountService } from 'src/app/BankAccount/bank-account.service';
import { add_bank_account } from 'src/app/Shared/Modals/BankAccount/add_bank_account';
import { PassbookActivityToastService } from 'src/app/Shared/passbook-activity-toast/passbook-activity-toast.service';

@Component({
  selector: 'app-withdraw-coins-request',
  templateUrl: './withdraw-coins-request.component.html',
  styleUrls: ['./withdraw-coins-request.component.css']
})
export class WithdrawCoinsRequestComponent {

  readonly minWithdrawCoins = 1000;

  banks: Ibank_details[] = [];
  _sessionUser: bigint;
  withdrawCoinRequestFrom: FormGroup;
  submitted = false;
  returnType: any;
  bankdetails: Ibank_details;
  withdrawcoinrequestmodalobj: Iwithdrawcoinrequestmodal = new withdrawcoinrequestmodal();
  site: any;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private router: Router,
    private coinsservice: CoinsService,
    private toasterService: ToastrService,
    public authservice: AuthService,
    private commonService: CommonService,
    private bankAccountService: BankAccountService,
    private passbookToast: PassbookActivityToastService
  ) {
    this._sessionUser = authservice.user.userId;
    this.withdrawCoinRequestFrom = this.formBuilder.group({
      coins: ['', [Validators.required, Validators.min(this.minWithdrawCoins)]],
      bankDropdown: ['', [Validators.required]]
    });
    this.bankdetails = new bank_details();
    this.loadBankAccounts();
  }

  loadBankAccounts(): void {
    const bankobj = new GetUserBankAccount(this.authservice.user.userId, this.authservice.user.userId, 1);
    this.coinsservice.get_bank_accounts(bankobj).subscribe({
      next: (response) => {
        this.returnType = response;
        this.banks = this.returnType['returnList'] ?? [];
        if (this.banks.length > 0) {
          const defaultBank = this.banks.find((b) => b.isDefault === '1') ?? this.banks[0];
          this.withdrawCoinRequestFrom.patchValue({ bankDropdown: defaultBank.bankAccountDetailID });
          this.GetBankAccountsById(defaultBank.bankAccountDetailID);
        }
      },
      error: () => {
        this.toasterService.warning('Unable to load bank accounts.');
      }
    });
  }

  openAddBankAccount(): void {
    this.bankAccountService.OpenUserBankAccountPopup(false, new add_bank_account(), false);
    this.bankAccountService.bsmodalRef?.onHide?.subscribe(() => {
      this.loadBankAccounts();
    });
  }

  withdrawCoinRequest() {
    this.submitted = true;

    if (this.withdrawCoinRequestFrom.invalid) {
      return;
    }

    const siteAccountId = this.site?.accountId != null && this.site.accountId !== ''
      ? this.site.accountId
      : (0 as unknown as bigint);

    this.withdrawcoinrequestmodalobj.coins = this.withdrawCoinRequestFrom.value['coins'];
    this.withdrawcoinrequestmodalobj.bankId = this.withdrawCoinRequestFrom.value['bankDropdown'];
    this.withdrawcoinrequestmodalobj.sessionUser = this.authservice.user.userId;
    this.withdrawcoinrequestmodalobj.userId = this.authservice.user.userId;
    this.withdrawcoinrequestmodalobj.accountId = siteAccountId;

    const request$ = siteAccountId && siteAccountId !== (0 as unknown as bigint)
      ? this.coinsservice.withdraw_coin_from_site_request_insert(this.withdrawcoinrequestmodalobj)
      : this.coinsservice.withdraw_coin_request_insert(this.withdrawcoinrequestmodalobj);

    request$.subscribe({
      next: (response) => {
        this.returnType = response;
        this.commonService.toastrMessages(this.returnType);
        const status = (response as any)?.returnStatus ?? (response as any)?.ReturnStatus;
        if (status === 1) {
          this.passbookToast.show({
            kind: 'withdraw',
            title: 'Withdraw request submitted',
            subtitle: this.site?.siteName || this.site?.userName || 'Wallet',
            amountLabel: `₹${this.withdrawcoinrequestmodalobj.coins}`,
            detail: 'Track status in Passbook after processing.'
          });
          this.bsModalRef.hide();
        }
      },
      error: (error) => {
        console.log(error);
        this.toasterService.warning('Unable to submit withdraw request.');
      }
    });
  }

  ChangeWithDrawBank(event: Event): void {
    const bankId = (event.target as HTMLSelectElement).value as unknown as bigint;
    this.coinsservice.set_default_bank_account(this._sessionUser, bankId).subscribe({
      next: () => {
        this.GetBankAccountsById(bankId);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  GetBankAccountsById(bankId: bigint): void {
    this.coinsservice.get_bank_account_by_id(bankId).subscribe({
      next: (response) => {
        this.returnType = response;
        this.bankdetails = this.returnType['returnVal'] ?? new bank_details();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
