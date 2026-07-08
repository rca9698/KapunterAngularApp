import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { Ipassbook_detail_model } from 'src/app/Shared/Modals/passbook_detail_model';
import { SitesService } from 'src/app/Sites/sites.service';
import { PassbookService } from 'src/app/Passbook/passbook.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { AuthService } from 'src/app/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-site-accounts-history',
  templateUrl: './user-site-accounts-history.component.html',
  styleUrls: [
    './user-site-accounts-history.component.css',
    '../../shared/admin-listing.shared.css',
    '../../../Sites/getUserListSiteById/get-user-list-site-by-id.component.css'
  ]
})
export class UserSiteAccountsHistoryComponent implements OnInit {
  sites: ISiteDetailModal[] = [];
  expandedSiteId: number | null = null;
  passbooks: Ipassbook_detail_model[] = [];
  sitePath = environment.imagePath.sitePath;

  loadingSites = false;
  loadingHistory = false;

  targetUserId: string | number | null = null;
  displayUserNumber = '';

  private readonly _sessionUser: bigint;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private siteService: SitesService,
    private passbookService: PassbookService,
    private toasterService: ToastrService,
    private authService: AuthService
  ) {
    this._sessionUser = this.authService.user.userId;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const userIdParam = params.get('userId');
      if (!userIdParam) {
        this.router.navigate(['/adminaction/user_list']);
        return;
      }
      this.targetUserId = userIdParam;
      this.loadSites();
    });

    this.route.queryParamMap.subscribe(query => {
      this.displayUserNumber = query.get('userNumber') ?? '';
    });
  }

  backToUserList(): void {
    this.router.navigate(['/adminaction/user_list']);
  }

  loadSites(): void {
    if (!this.targetUserId) {
      return;
    }

    this.loadingSites = true;
    this.sites = [];
    this.expandedSiteId = null;
    this.passbooks = [];

    this.siteService.getUserSitesById(this.targetUserId).subscribe({
      next: (resp: any) => {
        if (resp['returnStatus'] == 1) {
          this.sites = resp['returnList'] ?? [];
        } else {
          this.toasterService.warning(resp.returnMessage ?? 'Unable to load user accounts.');
          this.sites = [];
        }
        this.loadingSites = false;
      },
      error: () => {
        this.toasterService.error('Failed to load user accounts.');
        this.sites = [];
        this.loadingSites = false;
      }
    });
  }

  toggleTransactionHistory(site: ISiteDetailModal): void {
    if (this.isHistoryOpen(site)) {
      this.expandedSiteId = null;
      this.passbooks = [];
      return;
    }
    this.expandedSiteId = site.siteId;
    this.loadTransactionHistory(site);
  }

  isHistoryOpen(site: ISiteDetailModal): boolean {
    return this.expandedSiteId === site.siteId;
  }

  hasSiteImage(site: ISiteDetailModal): boolean {
    return !!(site.documentDetailId && site.fileExtenstion);
  }

  getSiteImageUrl(site: ISiteDetailModal): string {
    if (!this.hasSiteImage(site)) {
      return '';
    }
    return `${this.sitePath}${site.documentDetailId}${site.fileExtenstion}`;
  }

  loadTransactionHistory(site: ISiteDetailModal): void {
    if (!this.targetUserId || !site.siteId) {
      this.passbooks = [];
      return;
    }

    this.loadingHistory = true;
    this.passbooks = [];

    const obj = {
      userId: this.targetUserId,
      siteId: site.siteId,
      sessionUser: this._sessionUser
    };

    this.passbookService.passbookHistorylist(obj).subscribe({
      next: (resp: any) => {
        if (resp['returnStatus'] == 1) {
          this.passbooks = resp['returnList'] ?? [];
        } else {
          this.toasterService.warning(resp.returnMessage ?? 'Unable to load transaction history.');
          this.passbooks = [];
        }
        this.loadingHistory = false;
      },
      error: () => {
        this.toasterService.error('Error loading transaction history.');
        this.passbooks = [];
        this.loadingHistory = false;
      }
    });
  }
}
