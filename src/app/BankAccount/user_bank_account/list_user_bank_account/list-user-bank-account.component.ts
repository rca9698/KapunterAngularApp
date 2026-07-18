import { Component, OnInit } from '@angular/core';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { BankAccountService } from '../../bank-account.service';
import { GetUserBankAccount, IGetUserBankAccount } from 'src/app/Shared/Modals/BankAccount/get_user_bank_account'
import { AuthService } from 'src/app/auth.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { MakeDefaultService } from 'src/app/Shared/Modules/make-default-module/make-default.service';
import { Iadd_bank_account, add_bank_account } from 'src/app/Shared/Modals/BankAccount/add_bank_account';
import { buildQrImageUrlFromDetail, isDefaultPayment } from 'src/app/Shared/Utils/qr-image.util';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-list-user-bank-account',
  templateUrl: './list-user-bank-account.component.html',
  styleUrls: ['./list-user-bank-account.component.css']
})
export class ListUserBankAccountComponent implements OnInit {
  /** User withdraw payment methods (Bank / UPI / QR). */
  readonly paymentMethodsEnabled = true;

  Ibank_details: Ibank_details[] | undefined; 
  Iuser_upi_details: any[] | undefined;
  Iuser_qr_details: any[] | undefined;
  returnType: any;
  getbankaccount: IGetUserBankAccount = new GetUserBankAccount();
  add_bank_account: Iadd_bank_account = new add_bank_account();
  isActive: boolean = false;
  activePaymentTab: 'bank' | 'upi' | 'qr' = 'bank';
  bankFilter: 'active' | 'deleted' | 'history' = 'active';

  constructor(private bankaccount: BankAccountService, private authService: AuthService
    , private deleteService: DeleteService, private makedefaultservice: MakeDefaultService 
  ) {

  }

  ngOnInit(): void {
    if (!this.paymentMethodsEnabled) {
      return;
    }
    this.list_User_Bank_Accounts();
    this.list_User_Upi_Accounts();
    this.list_User_QR_Accounts();
  }

  setPaymentTab(tab: 'bank' | 'upi' | 'qr'): void {
    this.activePaymentTab = tab;
    if (tab === 'bank') {
      this.list_User_Bank_Accounts();
    } else if (tab === 'upi') {
      this.list_User_Upi_Accounts();
    } else {
      this.list_User_QR_Accounts();
    }
  }

  setBankFilter(filter: 'active' | 'deleted' | 'history'): void {
    this.bankFilter = filter;
    if (filter === 'active') {
      this.list_User_Bank_Accounts();
    } else if (filter === 'deleted') {
      this.list_User__InActive_Bank_Accounts();
    } else {
      this.list_User__All_Bank_Accounts();
    }
  }

  list_User_Bank_Accounts(){
    this.isActive = true;
    this.bankFilter = 'active';
    const bank_details = new GetUserBankAccount(); 
    bank_details.isActive = 1;
    bank_details.sessionUser = this.authService.user.userId;
    bank_details.userId = this.authService.user.userId;

    this.bankaccount.list_User_Bank_Accounts(bank_details).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.Ibank_details = this.returnType['returnList'];
      },
      error:error => {
        console.log(error);
      }
    });
  }

  list_User__InActive_Bank_Accounts(){
    this.isActive = false;
    this.bankFilter = 'deleted';
    const bank_details = new GetUserBankAccount(); 
    bank_details.isActive = 0;
    bank_details.sessionUser = this.authService.user.userId;
    bank_details.userId = this.authService.user.userId;

    this.bankaccount.list_User_Bank_Accounts(bank_details).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.Ibank_details = this.returnType['returnList'];
      },
      error:error => {
        console.log(error);
      }
    });
  }

  list_User__All_Bank_Accounts(){
    this.isActive = false;
    this.bankFilter = 'history';
    const bank_details = new GetUserBankAccount(); 
    bank_details.isActive = 2;
    bank_details.sessionUser = this.authService.user.userId;
    bank_details.userId = this.authService.user.userId;

    this.bankaccount.list_User_Bank_Accounts(bank_details).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.Ibank_details = this.returnType['returnList'];
      },
      error:error => {
        console.log(error);
      }
    });
  }

  AddBankDetailPopup() {
    this.bankaccount.OpenUserBankAccountPopup(false, this.add_bank_account);
    this.refreshAfterModalClose(() => this.list_User_Bank_Accounts());
  }

  AddUserUpiPopup() {
    this.bankaccount.OpenUserUpiPopup();
    this.refreshAfterModalClose(() => this.list_User_Upi_Accounts());
  }

  AddUserQRPopup() {
    this.bankaccount.OpenUserQRPopup();
    this.refreshAfterModalClose(() => this.list_User_QR_Accounts());
  }

  private refreshAfterModalClose(refresh: () => void): void {
    this.bankaccount.bsmodalRef?.onHide?.subscribe(() => refresh());
  }

  list_User_Upi_Accounts() {
    this.bankaccount.list_User_Upi_Accounts().subscribe({
      next: (response) => {
        this.returnType = response;
        this.Iuser_upi_details = this.returnType['returnList'];
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  list_User_QR_Accounts() {
    this.bankaccount.list_User_QR_Accounts().subscribe({
      next: (response) => {
        this.returnType = response;
        const list = (this.returnType?.['returnList'] as any[]) || [];
        const qrBase = environment.imagePath.QR;
        this.Iuser_qr_details = list.map((qr) => ({
          ...qr,
          qrImageUrl: qr.qrImageUrl || buildQrImageUrlFromDetail(qrBase, qr)
        }));
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  isDefaultFlag(value: unknown): boolean {
    return isDefaultPayment(value);
  }

  MakeUpiDetailDefault(obj: any) {
    this.makedefaultservice.OpenMakeDefaultPopup('userupi', 'UPI', obj);
  }

  DeleteUpiDetailPopup(obj: any) {
    this.deleteService.OpenDeletePopup('userupi', 'UPI', obj);
  }

  MakeQRDetailDefault(obj: any) {
    this.makedefaultservice.OpenMakeDefaultPopup('userqr', 'QR', obj);
  }

  DeleteQRDetailPopup(obj: any) {
    this.deleteService.OpenDeletePopup('userqr', 'QR', obj);
  }

  MakeBankDetailDefault(obj: any) {
    this.makedefaultservice.OpenMakeDefaultPopup('userbank','Bank',obj);
  }

  DeleteBankAccountPopup(obj: any) {
    this.deleteService.OpenDeletePopup('userbank','Bank',obj);
  }
}
