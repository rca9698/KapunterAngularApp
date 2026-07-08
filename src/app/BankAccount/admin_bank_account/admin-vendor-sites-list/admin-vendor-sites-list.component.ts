import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SitesService } from 'src/app/Sites/sites.service';
import { AuthService } from 'src/app/auth.service';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { BankAccountService } from '../../bank-account.service';
import { pickPaymentDetailList } from 'src/app/Shared/Utils/qr-image.util';

interface SitePaymentSummary {
  bank: number;
  upi: number;
  qr: number;
}

@Component({
  selector: 'app-admin-vendor-sites-list',
  templateUrl: './admin-vendor-sites-list.component.html',
  styleUrls: ['./admin-vendor-sites-list.component.css']
})
export class AdminVendorSitesListComponent implements OnInit {
  sites: ISiteDetailModal[] = [];
  sitePath: string | undefined;
  loading = true;
  paymentSummaries: Record<number, SitePaymentSummary> = {};
  private readonly _sessionUser: any;

  constructor(
    private sitesService: SitesService,
    private authService: AuthService,
    private toasterService: ToastrService,
    private bankAccountService: BankAccountService
  ) {
    this.sitePath = environment.imagePath.sitePath;
    this._sessionUser = this.authService.user.userId;
  }

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites(): void {
    this.loading = true;
    this.sitesService.getSiteList({ SessionUser: this._sessionUser }).subscribe({
      next: (resp: any) => {
        if (resp?.returnStatus == 1) {
          this.sites = resp.returnList ?? [];
          this.loadPaymentSummaries();
        } else {
          this.sites = [];
          this.toasterService.warning(resp?.returnMessage || 'Unable to load sites.');
          this.loading = false;
        }
      },
      error: () => {
        this.sites = [];
        this.loading = false;
        this.toasterService.warning('Unable to load sites. Please try again.');
      }
    });
  }

  private loadPaymentSummaries(): void {
    if (!this.sites.length) {
      this.loading = false;
      return;
    }

    const requests = this.sites.map((site) =>
      forkJoin({
        bank: this.bankAccountService.list_Admin_Bank_Accounts(site.siteId).pipe(catchError(() => of(null))),
        upi: this.bankAccountService.list_admin_upi_accounts(site.siteId).pipe(catchError(() => of(null))),
        qr: this.bankAccountService.list_admin_QR_accounts(site.siteId).pipe(catchError(() => of(null)))
      }).pipe(
        map(({ bank, upi, qr }) => ({
          siteId: site.siteId,
          summary: {
            bank: pickPaymentDetailList(bank).length,
            upi: pickPaymentDetailList(upi).length,
            qr: pickPaymentDetailList(qr).length
          }
        }))
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        this.paymentSummaries = {};
        results.forEach(({ siteId, summary }) => {
          this.paymentSummaries[siteId] = summary;
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  trackBySiteId(_index: number, site: ISiteDetailModal): number {
    return site.siteId;
  }

  getSummary(siteId: number): SitePaymentSummary {
    return this.paymentSummaries[siteId] ?? { bank: 0, upi: 0, qr: 0 };
  }

  totalOptions(siteId: number): number {
    const s = this.getSummary(siteId);
    return s.bank + s.upi + s.qr;
  }

  openManagePayments(site: ISiteDetailModal): void {
    const ref = this.bankAccountService.OpenViewAdminSitePaymentPopup(site);
    ref?.onHidden?.subscribe(() => this.loadSites());
  }
}
