import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BankAccountService } from '../../bank-account.service';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'src/app/toastr/toastr.service';
import {
  buildLegacyQrBlobUrl,
  buildQrImageUrlFromDetail,
  pickFirstPaymentDetail
} from 'src/app/Shared/Utils/qr-image.util';

@Component({
  selector: 'app-view-admin-site-payment',
  templateUrl: './view-admin-site-payment.component.html',
  styleUrls: ['./view-admin-site-payment.component.css']
})
export class ViewAdminSitePaymentComponent implements OnInit {
  site!: ISiteDetailModal;
  loading = true;
  bankDetail: Ibank_details | null = null;
  upiDetail: Ibank_details | null = null;
  qrDetail: Ibank_details | null = null;
  qrPath: string | undefined;
  qrDisplayUrl = '';

  constructor(
    public bsModalRef: BsModalRef,
    private bankAccountService: BankAccountService,
    private deleteService: DeleteService,
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
        this.bankDetail = pickFirstPaymentDetail(bank);
        this.upiDetail = pickFirstPaymentDetail(upi);
        this.qrDetail = pickFirstPaymentDetail(qr);
        this.refreshQrImageUrl();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toasterService.error('Unable to load payment details.');
      }
    });
  }

  private refreshQrImageUrl(): void {
    this.qrDisplayUrl = buildQrImageUrlFromDetail(this.qrPath, this.qrDetail);
  }

  onQrImageError(): void {
    if (!this.qrDetail) {
      return;
    }

    const legacyUrl = buildLegacyQrBlobUrl(
      this.qrPath,
      this.qrDetail.documentDetailId,
      this.qrDetail.fileExtenstion
    );

    if (legacyUrl && this.qrDisplayUrl !== legacyUrl) {
      this.qrDisplayUrl = legacyUrl;
    }
  }

  get qrImageUrl(): string {
    return this.qrDisplayUrl;
  }

  deleteBank(): void {
    if (!this.bankDetail) return;
    this.deleteService.OpenDeletePopup('adminbank', 'Bank', this.bankDetail);
    this.deleteService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  deleteUpi(): void {
    if (!this.upiDetail) return;
    this.deleteService.OpenDeletePopup('adminupi', 'UPI', this.upiDetail);
    this.deleteService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  deleteQr(): void {
    if (!this.qrDetail) return;
    this.deleteService.OpenDeletePopup('adminqr', 'QR', this.qrDetail);
    this.deleteService.bsmodalRef?.onHidden?.subscribe(() => this.loadPaymentDetails());
  }

  hasAnyDetail(): boolean {
    return !!(this.bankDetail || this.upiDetail || this.qrDetail);
  }
}
