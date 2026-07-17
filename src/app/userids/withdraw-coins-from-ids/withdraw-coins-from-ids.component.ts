import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Iupdate_coins_to_ids_request_modal, update_coins_to_ids_request_modal } from 'src/app/Shared/Modals/Coins/update_coins_to_ids_request_modal';
import { UserIdsService } from '../user-ids.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { CommonService } from 'src/app/common.service';
import { CoinsService } from '../../admincoinsaction/coins/coins.service';
import { Ibank_details, bank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { GetUserBankAccount } from 'src/app/Shared/Modals/BankAccount/get_user_bank_account';
import { BankAccountService } from 'src/app/BankAccount/bank-account.service';
import { add_bank_account } from 'src/app/Shared/Modals/BankAccount/add_bank_account';

@Component({
  selector: 'app-withdraw-coins-from-ids',
  templateUrl: './withdraw-coins-from-ids.component.html',
  styleUrls: ['./withdraw-coins-from-ids.component.css']
})
export class WithdrawCoinsFromIdsComponent {
  obj: any;

  WithdrawCoinsToIdsForm: FormGroup;
  submitted = false;
  _sessionUser: bigint;
  withdrawCoinsToIds: Iupdate_coins_to_ids_request_modal = new update_coins_to_ids_request_modal();
  banks: Ibank_details[] = [];
  bankdetails: Ibank_details = new bank_details();
  returnType: any;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private useridsservice: UserIdsService,
    private toasterService: ToastrService,
    public authservice: AuthService,
    private commonservice: CommonService,
    private coinsservice: CoinsService,
    private bankAccountService: BankAccountService
  ) {
    this.WithdrawCoinsToIdsForm = this.formBuilder.group({
      coins: ['', [Validators.required]],
      bankDropdown: ['', [Validators.required]]
    });
    this._sessionUser = authservice.user.userId;
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
          this.WithdrawCoinsToIdsForm.patchValue({ bankDropdown: defaultBank.bankAccountDetailID });
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

  ChangeWithDrawBank(event: Event): void {
    const bankId = (event.target as HTMLSelectElement).value as unknown as bigint;
    this.GetBankAccountsById(bankId);
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

  SendWithdrawCoinsFromIds() {
    this.submitted = true;

    if (this.WithdrawCoinsToIdsForm.invalid) {
      return;
    }

    this.withdrawCoinsToIds.coinType = 1;
    this.withdrawCoinsToIds.coins = this.WithdrawCoinsToIdsForm.value['coins'];
    this.withdrawCoinsToIds.accountId = this.obj.accountId;
    this.withdrawCoinsToIds.sessionUser = this._sessionUser;
    this.withdrawCoinsToIds.siteId = this.obj.siteId;
    this.withdrawCoinsToIds.userId = this._sessionUser;
    this.withdrawCoinsToIds.bankId = this.WithdrawCoinsToIdsForm.value['bankDropdown'];

    this.useridsservice.Withdraw_Coins_To_Id_Request(this.withdrawCoinsToIds).subscribe({
      next: (resp) => {
        this.returnType = resp;
        this.commonservice.toastrMessages(this.returnType);
        const status = (resp as any)?.returnStatus ?? (resp as any)?.ReturnStatus;
        if (status === 1) {
          this.bsModalRef.hide();
        }
      },
      error: (error: any) => {
        console.log(error);
        this.toasterService.warning('Unable to submit withdraw request.');
      }
    });
  }
}
