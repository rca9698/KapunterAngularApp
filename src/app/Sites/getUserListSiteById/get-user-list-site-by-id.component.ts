import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

interface AccountDetail {
  accountId: string | number;
  accountName: string;
  isActive: boolean;
  coins: number;
  createdDate?: string;
}

@Component({
  selector: 'app-get-user-list-site-by-id',
  templateUrl: './get-user-list-site-by-id.component.html',
  styleUrls: ['./get-user-list-site-by-id.component.css']
})
export class GetUserListSiteByIdComponent implements OnInit {

  sites: ISiteDetailModal[] | undefined;
  accounts: AccountDetail[] = [];
  selectedAccount: AccountDetail | null = null;
  sitePath: string | undefined;
  listSitesQuery: any;
  returnType: any;
  loading = false;
  depositType: 'site' | 'wallet' = 'wallet';
  userId: string | number | null = null;
  
  private readonly _sessionUser: any;

  constructor(
    private siteService: SitesService,
    private toasterService: ToastrService,
    private userIdService: UserIdsService,
    public authservice: AuthService,
    private coinsservice: CoinsService,
    private bsModalService: BsModalService,
    private activatedRoute: ActivatedRoute
  ) {
    this.sitePath = environment.imagePath.sitePath;
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    // Get userId from route parameters
    this.activatedRoute.params.subscribe(params => {
      this.userId = params['userId'] || this._sessionUser;
      this.loadAllSites();
    });
  }

  /**
   * Load all sites (merged functionality from user-list-sites)
   */
  loadAllSites(): void {
    this.loading = true;

    this.siteService.GetUserListSiteById(this._sessionUser).subscribe({
      next: (resp) => {
        this.returnType = resp;
        if (this.returnType['returnStatus'] == 1) {
          this.sites = this.returnType['returnList'];
        } else {
          this.toasterService.warning(this.returnType.returnMessage);
          this.sites = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sites:', err);
        this.toasterService.warning('Failed to load sites');
        this.sites = [];
        this.loading = false;
      }
    });
  }

  /**
   * Switch to a different account
   */
  selectAccount(account: AccountDetail): void {
    this.selectedAccount = account;
  }

  /**
   * Get active accounts count
   */
  getActiveAccountsCount(): number {
    return this.accounts.filter(acc => acc.isActive).length;
  }

  /**
   * Create new ID request for selected account and site
   */
  CreateIDRequest(site: ISiteDetailModal): void {
    const siteWithAccount = { ...site };
    this.userIdService.OpenAddIDRequestPopup(siteWithAccount);
  }

  /**
   * Open deposit modal for wallet
   */
  openDepositeCoinsRequest(site: ISiteDetailModal): void {
    console.log('Opening deposit modal for site:', site);
    this.coinsservice.OpenDepositeCoinsRequestPopup('Deposite', site);
  }

  /**
   * Open withdraw modal for wallet
   */
  openWithdrawCoinsRequest(site: ISiteDetailModal): void {
    console.log('Opening withdraw modal for site:', site);
    this.coinsservice.OpenWithdrawCoinsRequestPopup('Withdraw', site);
  }

  /**
   * Open transfer IDs list modal
   */
  openTransferIdsList(site: ISiteDetailModal): void {
    const initialState: ModalOptions = {
      initialState: { contextSite: site },
    };
    this.bsModalService.show(TransferIdsListModalComponent, initialState);
  }

  /**
   * Open site ID details modal with account ID and deposit type
   */
  openSiteIdDetails(site: ISiteDetailModal): void {
    const initialState: ModalOptions = {
      initialState: {
        contextSite: site,
        accountId: site.accountId,
        depositType: this.depositType
      },
    };
    this.bsModalService.show(SiteIdDetailsModalComponent, initialState);
  }

  
  /**
   * Open site ID details modal with account ID and deposit type
   */
  openTransactionHistoryDetails(site: ISiteDetailModal): void {
    const initialState: ModalOptions = {
      initialState: {
        contextSite: site,
        accountId: site.accountId
      },
    };
    this.bsModalService.show(GetUserSiteTransactionHistoryComponent, initialState);
  }

  /**
   * Open site in new tab
   */
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

  /**
   * Switch deposit type
   */
  switchDepositType(type: 'site' | 'wallet'): void {
    this.depositType = type;
  }
}
