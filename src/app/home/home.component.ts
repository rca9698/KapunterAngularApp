import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HomeService } from './home.service';
import { environment } from 'src/environments/environment';
import { IDashboardImages } from '../Shared/Modals/dashboard-images-modal';
import { CoinsService } from '../admincoinsaction/coins/coins.service';
import { AuthService } from '../auth.service';
import { ToastrService } from '../toastr/toastr.service';
import { UserService } from '../admincoinsaction/User/user.service';
import { AccountsService } from '../Accounts/accounts.service';
import { ISiteDetailModal } from '../Shared/Modals/site-detail-modal';
import { SitesService } from '../Sites/sites.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TransferIdsListModalComponent } from '../Sites/userListSites/transfer-ids-list-modal/transfer-ids-list-modal.component';
import { SiteIdDetailsModalComponent } from '../Sites/userListSites/site-id-details-modal/site-id-details-modal.component';
import { GetUserSiteTransactionHistoryComponent } from '../Sites/get-user-site-transaction-history/get-user-site-transaction-history.component';
import { RemoveIdRequestModalComponent } from '../Sites/remove-id-request-modal/remove-id-request-modal.component';
import { ReferralService } from '../Accounts/Profile/refer-earn/referral.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  returnType: any; 
  site: ISiteDetailModal = {} as ISiteDetailModal;
  imgPath: string | undefined;
  images: IDashboardImages[] = [];
  showslider = false;
  sites: ISiteDetailModal[] = [];
  sitePath: string | undefined;
  sitesLoading = false;
  depositType: 'site' | 'wallet' = 'wallet';
  showReferralBanner = false;
  referralCode = '';
  referralReward = 200;
  private referralSubs: Subscription[] = [];

  @ViewChild('accountCarousel') accountCarousel?: ElementRef<HTMLElement>;
  private accountCarouselInstance?: { dispose: () => void; cycle: () => void };

  constructor(private homeService:HomeService, private coinsservice: CoinsService
    , public authservice: AuthService, private toasterService: ToastrService
    , public userservice: UserService, private accountService: AccountsService
    , private siteService: SitesService
    , private bsModalService: BsModalService
    , private referralService: ReferralService){
    this.imgPath = environment.imagePath?.dashboardImages || '';
    this.sitePath = environment.imagePath?.sitePath || '';
  }

  ngOnInit(): void {
    this.referralSubs.push(
      this.referralService.showInviteBanner$.subscribe((show) => {
        this.showReferralBanner = show && !this.authservice.isLoggedIn;
      }),
      this.referralService.pendingCode$.subscribe((code) => {
        this.referralCode = code || '';
      }),
      this.referralService.rewardAmount$.subscribe((amount) => {
        this.referralReward = amount;
      }),
      this.authservice.isLoggenIn.subscribe((loggedIn) => {
        this.referralService.refreshBannerVisibility(!!loggedIn);
        this.showReferralBanner = this.referralService.showInviteBanner && !loggedIn;
      })
    );
    this.referralService.refreshBannerVisibility(this.authservice.isLoggedIn);

     this.homeService.getDashboradImages().subscribe({
      next: (resp) => {
        this.returnType = resp;
        const list = this.returnType?.returnList ?? this.returnType?.ReturnList;
        this.images = Array.isArray(list) ? list : [];
        this.showslider = this.images.length > 0;
      },
      error: () => {
        this.images = [];
        this.showslider = false;
      }
     });

     this.site = {} as ISiteDetailModal;

     if (this.authservice.token) {
       this.loadSites();
     }
  }

  ngOnDestroy(): void {
    this.referralSubs.forEach((s) => s.unsubscribe());
    this.disposeAccountCarousel();
  }

  openInviteLogin(): void {
    this.accountService.OpenLoginPopup(true, 'Login to claim invite');
  }

  dismissReferralBanner(): void {
    this.referralService.dismissBanner();
    this.showReferralBanner = false;
  }

  trackBySiteId(_index: number, site: ISiteDetailModal): number {
    return site.siteId;
  }

  loadSites(): void {
    this.sitesLoading = true;
    this.disposeAccountCarousel();
    this.siteService.GetUserListSiteById(this.authservice.user.userId).subscribe({
      next: (resp) => {
        this.returnType = resp;
        if (this.returnType['returnStatus'] == 1) {
          this.sites = this.returnType['returnList'] ?? [];
        } else {
          this.sites = [];
          this.toasterService.warning(this.returnType.returnMessage);
        }
        this.sitesLoading = false;
        if (this.sites.length > 1) {
          setTimeout(() => this.initAccountCarousel(), 50);
        }
      },
      error: () => {
        this.sites = [];
        this.sitesLoading = false;
        this.toasterService.warning('Failed to load account details.');
      }
    });
  }

  private initAccountCarousel(): void {
    const bootstrapApi = (window as { bootstrap?: { Carousel: new (el: HTMLElement, options?: object) => { dispose: () => void; cycle: () => void } } }).bootstrap;
    const element = this.accountCarousel?.nativeElement;

    if (!bootstrapApi?.Carousel || !element) {
      return;
    }

    this.disposeAccountCarousel();
    this.accountCarouselInstance = new bootstrapApi.Carousel(element, {
      interval: 10000,
      ride: false,
      wrap: true,
      touch: true,
      keyboard: true,
    });
    this.accountCarouselInstance.cycle();
  }

  private disposeAccountCarousel(): void {
    this.accountCarouselInstance?.dispose();
    this.accountCarouselInstance = undefined;
  }

  openDepositeCoinsRequest(site: ISiteDetailModal): void {
    this.coinsservice.OpenDepositeCoinsRequestPopup('Deposite', site);
  }

  openWithdrawCoinsRequest(site: ISiteDetailModal): void {
    this.coinsservice.OpenWithdrawCoinsRequestPopup('Withdraw', site);
  }

  openTransferIdsList(site: ISiteDetailModal): void {
    const initialState: ModalOptions = {
      initialState: { contextSite: site },
    };
    this.bsModalService.show(TransferIdsListModalComponent, initialState);
  }

  openSiteIdDetails(site: ISiteDetailModal): void {
    this.bsModalService.show(SiteIdDetailsModalComponent, {
      initialState: {
        contextSite: site,
        filterByAccount: true,
      },
    } as ModalOptions);
  }

  startRemoveAccount(site: ISiteDetailModal): void {
    if (!site?.accountId) {
      this.toasterService.warning('Unable to remove this ID right now.');
      return;
    }
    this.bsModalService.show(RemoveIdRequestModalComponent, {
      initialState: {
        site: { ...site },
        accountName: String(site.userName || ''),
        siteName: String(site.siteName || ''),
        onSubmitted: () => this.loadSites(),
      },
      class: 'modal-dialog-centered',
    } as ModalOptions);
  }

  openTransactionHistoryDetails(site: ISiteDetailModal): void {
    const initialState: ModalOptions = {
      initialState: {
        contextSite: site,
        accountId: site.accountId,
      },
    };
    this.bsModalService.show(GetUserSiteTransactionHistoryComponent, initialState);
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

  DepositeToWallet(){
    this.coinsservice.OpenDepositeCoinsRequestPopup('Deposite', this.site);
  }

  WithdrawFromWallet(){
    this.coinsservice.OpenWithdrawCoinsRequestPopup('Withdraw', this.site);
  }

  ActionToastr(){
    this.toasterService.warning('Action not allowed!!!');
  }

  openLogin(): void {
    this.accountService.OpenLoginPopup(true, 'Login');
  }

  logout(): void {
    this.authservice.logout();
  }
}
