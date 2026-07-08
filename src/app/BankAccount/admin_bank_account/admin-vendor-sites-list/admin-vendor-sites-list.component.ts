import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SitesService } from 'src/app/Sites/sites.service';
import { AuthService } from 'src/app/auth.service';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { BankAccountService } from '../../bank-account.service';

@Component({
  selector: 'app-admin-vendor-sites-list',
  templateUrl: './admin-vendor-sites-list.component.html',
  styleUrls: ['./admin-vendor-sites-list.component.css']
})
export class AdminVendorSitesListComponent implements OnInit {
  sites: ISiteDetailModal[] = [];
  sitePath: string | undefined;
  loading = true;
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
        } else {
          this.sites = [];
          this.toasterService.warning(resp?.returnMessage || 'Unable to load sites.');
        }
        this.loading = false;
      },
      error: () => {
        this.sites = [];
        this.loading = false;
        this.toasterService.warning('Unable to load sites. Please try again.');
      }
    });
  }

  trackBySiteId(_index: number, site: ISiteDetailModal): number {
    return site.siteId;
  }

  openAddAccount(site: ISiteDetailModal): void {
    const ref = this.bankAccountService.OpenAddAdminSitePaymentPopup(site);
    ref?.onHidden?.subscribe(() => this.loadSites());
  }

  openViewAccount(site: ISiteDetailModal): void {
    const ref = this.bankAccountService.OpenViewAdminSitePaymentPopup(site);
    ref?.onHidden?.subscribe(() => this.loadSites());
  }
}
