import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { SitesService } from '../../Sites/sites.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth.service';
import { UserIdsService } from 'src/app/userids/user-ids.service';
import { CoinsService } from 'src/app/admincoinsaction/coins/coins.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TransferIdsListModalComponent } from '../userListSites/transfer-ids-list-modal/transfer-ids-list-modal.component';
import { SiteIdDetailsModalComponent } from '../userListSites/site-id-details-modal/site-id-details-modal.component';
import { GetUserSiteTransactionHistoryComponent } from '../get-user-site-transaction-history/get-user-site-transaction-history.component';
import { RemoveIdRequestModalComponent } from '../remove-id-request-modal/remove-id-request-modal.component';
import { IdsService } from 'src/app/admincoinsaction/Ids/ids.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type IdsHubView = 'active' | 'create' | 'closed';

interface ClosedAccountRow {
  accountId: string | number;
  siteId: number;
  siteName: string;
  siteURL: string;
  userName: string;
  documentDetailId?: string;
  fileExtenstion?: string;
  reason?: string;
  settlementAmount?: number | null;
  closedDate?: string;
  createdDate?: string;
}

@Component({
  selector: 'app-get-user-list-site-by-id',
  templateUrl: './get-user-list-site-by-id.component.html',
  styleUrls: ['./get-user-list-site-by-id.component.css']
})
export class GetUserListSiteByIdComponent implements OnInit {

  view: IdsHubView = 'active';
  sites: ISiteDetailModal[] = [];
  createSites: ISiteDetailModal[] = [];
  closedAccounts: ClosedAccountRow[] = [];
  activeSiteIds = new Set<string>();

  sitePath: string | undefined;
  returnType: any;
  loading = false;
  userId: string | number | null = null;

  private readonly _sessionUser: any;

  constructor(
    private siteService: SitesService,
    private toasterService: ToastrService,
    private userIdService: UserIdsService,
    public authservice: AuthService,
    private coinsservice: CoinsService,
    private bsModalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private idsService: IdsService,
    private router: Router
  ) {
    this.sitePath = environment.imagePath?.sitePath || '';
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(q => {
      const raw = (q.get('view') || 'active').toLowerCase();
      this.view = raw === 'create' || raw === 'closed' ? raw : 'active';
    });

    this.activatedRoute.params.subscribe(params => {
      this.userId = params['userId'] || this._sessionUser;
      this.reloadHub();
    });
  }

  setView(view: IdsHubView): void {
    this.view = view;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { view },
      queryParamsHandling: 'merge'
    });
    if (view === 'closed' && !this.closedAccounts.length) {
      this.loadClosedAccounts();
    }
    if (view === 'create' && !this.createSites.length) {
      this.loadCreateSites();
    }
  }

  hasActiveAccount(site: ISiteDetailModal): boolean {
    if (site?.accountId) {
      return true;
    }
    return this.activeSiteIds.has(String(site?.siteId ?? ''));
  }

  canCreateOnClosedSite(item: ClosedAccountRow): boolean {
    return !this.activeSiteIds.has(String(item.siteId ?? ''));
  }

  reloadHub(): void {
    this.loading = true;
    const active$ = this.siteService.GetUserListSiteById(this._sessionUser).pipe(
      catchError(() => of({ returnStatus: 0, returnList: [] }))
    );
    const allSites$ = this.siteService.getSiteList({ SessionUser: this._sessionUser }).pipe(
      catchError(() => of({ returnStatus: 0, returnList: [] }))
    );
    const closed$ = this.idsService.deletedIds({
      userId: this._sessionUser,
      sessionUser: this._sessionUser,
      isDeleted: 1
    }).pipe(catchError(() => of({ returnStatus: 0, returnList: [] })));

    forkJoin({ active: active$, allSites: allSites$, closed: closed$ }).subscribe({
      next: ({ active, allSites, closed }) => {
        const activeResp: any = active;
        const allResp: any = allSites;
        const closedResp: any = closed;

        this.sites = (activeResp?.returnList ?? []) as ISiteDetailModal[];
        this.activeSiteIds = new Set(
          this.sites
            .filter(s => !!s?.accountId)
            .map(s => String(s.siteId))
        );

        const catalog = (allResp?.returnList ?? []) as ISiteDetailModal[];
        this.createSites = catalog.filter(s => !this.activeSiteIds.has(String(s.siteId)));

        this.closedAccounts = this.mapClosed(closedResp?.returnList ?? []);

        if (this.view === 'active' && !this.sites.length && this.createSites.length) {
          // Prefer Create when user has no active IDs yet
          this.setView('create');
        }

        this.loading = false;
      },
      error: () => {
        this.toasterService.warning('Failed to load IDs');
        this.sites = [];
        this.createSites = [];
        this.closedAccounts = [];
        this.loading = false;
      }
    });
  }

  private loadCreateSites(): void {
    this.siteService.getSiteList({ SessionUser: this._sessionUser }).subscribe({
      next: (resp: any) => {
        const catalog = (resp?.returnList ?? []) as ISiteDetailModal[];
        this.createSites = catalog.filter(s => !this.activeSiteIds.has(String(s.siteId)));
      }
    });
  }

  private loadClosedAccounts(): void {
    this.idsService.deletedIds({
      userId: this._sessionUser,
      sessionUser: this._sessionUser,
      isDeleted: 1
    }).subscribe({
      next: (resp: any) => {
        this.closedAccounts = this.mapClosed(resp?.returnList ?? []);
      }
    });
  }

  private mapClosed(list: any[]): ClosedAccountRow[] {
    return (list || []).map((row: any) => ({
      accountId: row.accountId ?? row.AccountId,
      siteId: Number(row.siteId ?? row.SiteId ?? 0),
      siteName: row.siteName ?? row.SiteName ?? '',
      siteURL: row.siteURL ?? row.SiteURL ?? '',
      userName: row.userName ?? row.UserName ?? '',
      documentDetailId: row.documentDetailId ?? row.DocumentDetailId,
      fileExtenstion: row.fileExtenstion ?? row.FileExtenstion,
      reason: row.reason ?? row.Reason ?? '',
      settlementAmount: row.settlementAmount ?? row.SettlementAmount ?? null,
      closedDate: row.closedDate ?? row.ClosedDate ?? '',
      createdDate: row.createdDate ?? row.CreatedDate ?? ''
    }));
  }

  CreateIDRequest(site: ISiteDetailModal): void {
    if (this.hasActiveAccount(site)) {
      this.toasterService.warning('You already have an active ID on this site. Close it before creating a new one.');
      this.setView('active');
      return;
    }
    this.userIdService.OpenAddIDRequestPopup({ ...site });
  }

  openDepositeCoinsRequest(site: ISiteDetailModal): void {
    this.coinsservice.OpenDepositeCoinsRequestPopup('Deposite', site);
  }

  openWithdrawCoinsRequest(site: ISiteDetailModal): void {
    this.coinsservice.OpenWithdrawCoinsRequestPopup('Withdraw', site);
  }

  openTransferIdsList(site: ISiteDetailModal): void {
    this.bsModalService.show(TransferIdsListModalComponent, {
      initialState: { contextSite: site }
    } as ModalOptions);
  }

  openSiteIdDetails(site: ISiteDetailModal): void {
    this.bsModalService.show(SiteIdDetailsModalComponent, {
      initialState: { contextSite: site, filterByAccount: true }
    } as ModalOptions);
  }

  openTransactionHistoryDetails(site: ISiteDetailModal): void {
    this.bsModalService.show(GetUserSiteTransactionHistoryComponent, {
      initialState: { contextSite: site },
      class: 'modal-lg'
    } as ModalOptions);
  }

  openSiteLink(site: ISiteDetailModal): void {
    const raw = (site.siteURL || '').trim();
    if (!raw) {
      this.toasterService.warning('No URL for this site.');
      return;
    }
    const url = /^https?:\/\//i.test(raw)
      ? raw.replace(/^http:\/\//i, 'https://')
      : `https://${raw}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  startRemoveAccount(site: ISiteDetailModal): void {
    if (!site?.accountId) {
      this.toasterService.warning('Unable to remove this ID right now.');
      return;
    }
    const ref = this.bsModalService.show(RemoveIdRequestModalComponent, {
      initialState: {
        site: { ...site },
        accountName: String(site.userName || ''),
        siteName: String(site.siteName || ''),
        onSubmitted: () => this.reloadHub()
      },
      class: 'modal-dialog-centered'
    } as ModalOptions);
    ref?.onHidden?.subscribe(() => {
      // no-op; hub refresh handled on success
    });
  }
}
