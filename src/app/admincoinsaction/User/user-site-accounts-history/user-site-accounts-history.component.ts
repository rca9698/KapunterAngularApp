import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { Ipassbook_detail_model } from 'src/app/Shared/Modals/passbook_detail_model';
import { SitesService } from 'src/app/Sites/sites.service';
import { PassbookService } from 'src/app/Passbook/passbook.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { AuthService } from 'src/app/auth.service';
import { environment } from 'src/environments/environment';
import { resolveAccountId } from 'src/app/admincoinsaction/shared/id-request.util';
import {
  filterPassbooksForSiteAccount,
  passbookFilterFromSite,
} from 'src/app/Shared/Utils/passbook-account.util';
import { formatPassbookAmount, isNonMonetaryPassbookActivity } from 'src/app/Shared/Utils/passbook-display.util';

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
  expandedAccountKey: string | null = null;
  passbooksByAccount: Record<string, Ipassbook_detail_model[]> = {};
  loadingHistoryKey: string | null = null;

  expandedTxnKey: string | null = null;
  txnDetailsByKey: Record<string, Ipassbook_detail_model> = {};
  loadingTxnKey: string | null = null;

  sitePath = environment.imagePath.sitePath;
  proofPath = environment.imagePath.proofPath;

  loadingSites = false;
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

  getAccountKey(site: ISiteDetailModal): string {
    const accountId = resolveAccountId(site as unknown as Record<string, unknown>);
    return accountId ? `${site.siteId}-${accountId}` : `${site.siteId}-${site.userNumber ?? site.userName ?? 'default'}`;
  }

  loadSites(): void {
    if (!this.targetUserId) {
      return;
    }

    this.loadingSites = true;
    this.sites = [];
    this.resetHistoryState();

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
    const key = this.getAccountKey(site);
    if (this.expandedAccountKey === key) {
      this.resetHistoryState();
      return;
    }
    this.expandedAccountKey = key;
    this.expandedTxnKey = null;
    this.loadTransactionHistory(site, key);
  }

  isHistoryOpen(site: ISiteDetailModal): boolean {
    return this.expandedAccountKey === this.getAccountKey(site);
  }

  isHistoryLoading(site: ISiteDetailModal): boolean {
    return this.loadingHistoryKey === this.getAccountKey(site);
  }

  getPassbooksForSite(site: ISiteDetailModal): Ipassbook_detail_model[] {
    return this.passbooksByAccount[this.getAccountKey(site)] ?? [];
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

  trackBySiteKey = (_index: number, site: ISiteDetailModal): string => this.getAccountKey(site);

  trackByTxnKey = (index: number, txn: Ipassbook_detail_model): string => this.getTxnKey(txn, index);

  getTxnKey(txn: Ipassbook_detail_model, index: number): string {
    const id = txn.passbookHistoryId?.trim();
    return id ? `${id}-${index}` : `txn-${index}`;
  }

  loadTransactionHistory(site: ISiteDetailModal, accountKey: string): void {
    if (!this.targetUserId || !site.siteId) {
      this.passbooksByAccount[accountKey] = [];
      return;
    }

    this.loadingHistoryKey = accountKey;
    this.passbooksByAccount[accountKey] = [];
    this.expandedTxnKey = null;

    const obj = {
      userId: this.targetUserId,
      siteId: Number(site.siteId),
      sessionUser: this._sessionUser
    };

    this.passbookService.passbookHistorylist(obj).subscribe({
      next: (resp: any) => {
        if (resp['returnStatus'] == 1) {
          const all: Ipassbook_detail_model[] = resp['returnList'] ?? [];
          this.passbooksByAccount[accountKey] = filterPassbooksForSiteAccount(
            all,
            passbookFilterFromSite(site)
          );
        } else {
          this.toasterService.warning(resp.returnMessage ?? 'Unable to load transaction history.');
          this.passbooksByAccount[accountKey] = [];
        }
        this.loadingHistoryKey = null;
      },
      error: () => {
        this.toasterService.error('Error loading transaction history.');
        this.passbooksByAccount[accountKey] = [];
        this.loadingHistoryKey = null;
      }
    });
  }

  isTxnExpanded(txn: Ipassbook_detail_model, index: number): boolean {
    return this.expandedTxnKey === this.getTxnKey(txn, index);
  }

  isTxnLoading(txn: Ipassbook_detail_model, index: number): boolean {
    return this.loadingTxnKey === this.getTxnKey(txn, index);
  }

  resolveTxnDetail(txn: Ipassbook_detail_model, index: number): Ipassbook_detail_model {
    return this.txnDetailsByKey[this.getTxnKey(txn, index)] ?? txn;
  }

  toggleTxnDetail(txn: Ipassbook_detail_model, index: number): void {
    const key = this.getTxnKey(txn, index);
    if (this.expandedTxnKey === key) {
      this.expandedTxnKey = null;
      return;
    }
    this.expandedTxnKey = key;
    this.txnDetailsByKey[key] = { ...txn };
    this.loadTxnDetail(key, txn.passbookHistoryId, txn);
  }

  getTxnLabel(txn: Ipassbook_detail_model): string {
    const activity = txn.activityDescription?.trim();
    if (activity && activity.toLowerCase() !== txn.trxStatus?.trim().toLowerCase()) {
      return activity;
    }
    return activity || 'Wallet transaction';
  }

  getTxnAmount(txn: Ipassbook_detail_model): string {
    const amount = formatPassbookAmount(txn);
    if (amount) {
      return amount;
    }
    return isNonMonetaryPassbookActivity(txn) ? 'ID only' : '—';
  }

  showsTxnAmount(txn: Ipassbook_detail_model): boolean {
    return formatPassbookAmount(txn) != null;
  }

  hasTxnImage(txn: Ipassbook_detail_model): boolean {
    return !!(txn.documentDetailId && txn.fileExtenstion);
  }

  getTxnImageUrl(txn: Ipassbook_detail_model): string {
    if (!this.hasTxnImage(txn)) {
      return '';
    }
    return `${this.sitePath}${txn.documentDetailId}${txn.fileExtenstion}`;
  }

  hasProofImage(txn: Ipassbook_detail_model): boolean {
    return !!(txn.proofDocumentDetailID && (txn.proofFileExtenstion || txn.fileExtenstion));
  }

  getProofImageUrl(txn: Ipassbook_detail_model): string {
    if (!txn.proofDocumentDetailID) {
      return '';
    }
    const ext = txn.proofFileExtenstion || txn.fileExtenstion || '';
    return `${this.proofPath}${txn.proofDocumentDetailID}${ext}`;
  }

  private loadTxnDetail(
    cacheKey: string,
    passbookHistoryId: string,
    fallback: Ipassbook_detail_model
  ): void {
    this.loadingTxnKey = cacheKey;

    const obj = {
      PassbookId: passbookHistoryId,
      sessionUser: this._sessionUser
    };

    this.passbookService.passbookHistorybyid(obj).subscribe({
      next: (resp: any) => {
        const detail = resp?.['returnVal'] ?? resp?.['ReturnVal'];
        if (resp?.['returnStatus'] == 1 && detail) {
          this.txnDetailsByKey[cacheKey] = detail;
        }
        this.loadingTxnKey = null;
      },
      error: () => {
        this.loadingTxnKey = null;
      }
    });
  }

  private resetHistoryState(): void {
    this.expandedAccountKey = null;
    this.passbooksByAccount = {};
    this.loadingHistoryKey = null;
    this.expandedTxnKey = null;
    this.txnDetailsByKey = {};
    this.loadingTxnKey = null;
  }
}
