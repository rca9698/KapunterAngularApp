import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BankAccountService } from '../../bank-account.service';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { add_admin_bank_account } from 'src/app/Shared/Modals/BankAccount/add_admin_bank_account';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { MakeDefaultService } from 'src/app/Shared/Modules/make-default-module/make-default.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'src/app/toastr/toastr.service';
import {
  buildLegacyQrBlobUrl,
  buildQrImageUrlFromDetail,
  isDefaultPayment,
  pickPaymentDetailList
} from 'src/app/Shared/Utils/qr-image.util';

type PaymentTab = 'bank' | 'upi' | 'qr';

@Component({
  selector: 'app-view-admin-site-payment',
  templateUrl: './view-admin-site-payment.component.html',
  styleUrls: ['./view-admin-site-payment.component.css']
})
export class ViewAdminSitePaymentComponent implements OnInit {
  site!: ISiteDetailModal;
  loading = true;
  activeTab: PaymentTab = 'bank';

  bankList: Ibank_details[] = [];
  upiList: Ibank_details[] = [];
  qrList: Ibank_details[] = [];

  qrPath: string | undefined;
  private qrDisplayUrls: Record<string, string> = {};

  constructor(
    public bsModalRef: BsModalRef,
    private bankAccountService: BankAccountService,
    private deleteService: DeleteService,
    private makeDefaultService: MakeDefaultService,
    private toasterService: ToastrService
  ) {
    this.qrPath = environment.imagePath.QR;
  }

  ngOnInit(): void {
    this.loadPaymentDetails();
  }

  loadPaymentDetails(): void {
    if (!this.site?.siteId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    const siteId = this.site.siteId;

    forkJoin({
      bank: this.bankAccountService.list_Admin_Bank_Accounts(siteId).pipe(catchError(() => of(null))),
      upi: this.bankAccountService.list_admin_upi_accounts(siteId).pipe(catchError(() => of(null))),
      qr: this.bankAccountService.list_admin_QR_accounts(siteId).pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ bank, upi, qr }) => {
        this.bankList = pickPaymentDetailList(bank);
        this.upiList = pickPaymentDetailList(upi);
        this.qrList = pickPaymentDetailList(qr);
        this.qrDisplayUrls = {};
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toasterService.error('Unable to load payment details.');
      }
    });
  }

  setTab(tab: PaymentTab): void {
    this.activeTab = tab;
  }

  isDefault(value: unknown): boolean {
    return isDefaultPayment(value);
  }

  openAddBank(): void {
    const payload = new add_admin_bank_account();
    payload.siteId = this.site.siteId;
    this.bankAccountService.OpenAddAdminBankAccountPopup(false, payload, this.site.siteName);
    this.bankAccountService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  openAddUpi(): void {
    const payload = new add_admin_bank_account();
    payload.siteId = this.site.siteId;
    this.bankAccountService.OpenAddAdminUpiPopup(false, payload, this.site.siteName);
    this.bankAccountService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  openAddQr(): void {
    const payload = new add_admin_bank_account();
    payload.siteId = this.site.siteId;
    this.bankAccountService.OpenAddAdminQRPopup(false, payload, this.site.siteName);
    this.bankAccountService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  makeBankDefault(item: Ibank_details): void {
    this.makeDefaultService.OpenMakeDefaultPopup('adminbank', 'Bank', item);
    this.makeDefaultService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  makeUpiDefault(item: Ibank_details): void {
    this.makeDefaultService.OpenMakeDefaultPopup('adminupi', 'UPI', item);
    this.makeDefaultService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  makeQrDefault(item: Ibank_details): void {
    this.makeDefaultService.OpenMakeDefaultPopup('adminqr', 'QR', item);
    this.makeDefaultService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  deleteBank(item: Ibank_details): void {
    this.deleteService.OpenDeletePopup('adminbank', 'Bank', item);
    this.deleteService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  deleteUpi(item: Ibank_details): void {
    this.deleteService.OpenDeletePopup('adminupi', 'UPI', item);
    this.deleteService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  deleteQr(item: Ibank_details): void {
    this.deleteService.OpenDeletePopup('adminqr', 'QR', item);
    this.deleteService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  qrKey(detail: Ibank_details): string {
    return String(detail.bankAccountDetailID || detail.qrId || detail.documentDetailId);
  }

  qrImageUrl(detail: Ibank_details): string {
    const key = this.qrKey(detail);
    if (this.qrDisplayUrls[key]) {
      return this.qrDisplayUrls[key];
    }
    return buildQrImageUrlFromDetail(this.qrPath, detail);
  }

  onQrImageError(detail: Ibank_details): void {
    const key = this.qrKey(detail);
    const legacyUrl = buildLegacyQrBlobUrl(
      this.qrPath,
      detail.documentDetailId,
      detail.fileExtenstion
    );

    if (legacyUrl && this.qrDisplayUrls[key] !== legacyUrl) {
      this.qrDisplayUrls[key] = legacyUrl;
    }
  }

  totalCount(): number {
    return this.bankList.length + this.upiList.length + this.qrList.length;
  }
}
