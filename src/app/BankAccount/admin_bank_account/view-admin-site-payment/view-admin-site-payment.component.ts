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
        this.bankDetail = this.pickFirst(bank);
        this.upiDetail = this.pickFirst(upi);
        this.qrDetail = this.pickFirst(qr);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toasterService.error('Unable to load payment details.');
      }
    });
  }

  private pickFirst(response: any): Ibank_details | null {
    if (response?.returnStatus !== 1) {
      return null;
    }
    if (response.returnVal) {
      return response.returnVal;
    }
    const list = response.returnList as Ibank_details[] | undefined;
    return list?.length ? list[0] : null;
  }

  get qrImageUrl(): string {
    if (!this.qrDetail?.documentDetailId || !this.qrDetail?.fileExtenstion) {
      return '';
    }
    const ext = this.qrDetail.fileExtenstion.replace(/^\./, '');
    return `${this.qrPath}${this.qrDetail.documentDetailId}.${ext}`;
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
