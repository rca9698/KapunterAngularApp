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
  bannerSlides: IDashboardImages[] = [];
  showslider = false;
  bannersLoading = true;
  sites: ISiteDetailModal[] = [];
  sitePath: string | undefined;
  sitesLoading = false;
  depositType: 'site' | 'wallet' = 'wallet';
  showReferralBanner = false;
  referralCode = '';
  referralReward = 200;
  private referralSubs: Subscription[] = [];

  /** One standard for every dashboard slider: 5s per slide, smooth 0.6s animation. */
  private static readonly SLIDE_INTERVAL_MS = 5000;

  @ViewChild('bannerCarousel') bannerCarousel?: ElementRef<HTMLElement>;
  @ViewChild('accountCarousel') accountCarousel?: ElementRef<HTMLElement>;
  private bannerCarouselInstance?: { dispose: () => void; cycle: () => void };
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
        this.bannersLoading = false;
        this.returnType = resp;
        const list = this.returnType?.returnList ?? this.returnType?.ReturnList;
        this.images = Array.isArray(list) ? list : [];
        this.bannerSlides = this.images.filter((img) => this.isValidBanner(img));
        this.showslider = this.bannerSlides.length > 0;
        if (this.bannerSlides.length > 1) {
          setTimeout(() => this.initBannerCarousel(), 50);
        }
      },
      error: () => {
        this.bannersLoading = false;
        this.images = [];
        this.bannerSlides = [];
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
    this.disposeBannerCarousel();
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

  private createCarousel(element: HTMLElement | undefined): { dispose: () => void; cycle: () => void } | undefined {
    const bootstrapApi = (window as { bootstrap?: { Carousel: new (el: HTMLElement, options?: object) => { dispose: () => void; cycle: () => void } } }).bootstrap;
    if (!bootstrapApi?.Carousel || !element) {
      return undefined;
    }

    const instance = new bootstrapApi.Carousel(element, {
      interval: HomeComponent.SLIDE_INTERVAL_MS,
      ride: false,
      wrap: true,
      touch: true,
      keyboard: true,
      pause: 'hover',
    });
    instance.cycle();
    return instance;
  }

  private initBannerCarousel(): void {
    this.disposeBannerCarousel();
    this.bannerCarouselInstance = this.createCarousel(this.bannerCarousel?.nativeElement);
  }

  private initAccountCarousel(): void {
    this.disposeAccountCarousel();
    this.accountCarouselInstance = this.createCarousel(this.accountCarousel?.nativeElement);
  }

  private disposeBannerCarousel(): void {
    this.bannerCarouselInstance?.dispose();
    this.bannerCarouselInstance = undefined;
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

  bannerSrc(image: IDashboardImages): string {
    return `${this.imgPath || ''}${image.documentDetailId || ''}${image.fileExtenstion || ''}`;
  }

  onBannerError(image: IDashboardImages): void {
    this.bannerSlides = this.bannerSlides.filter(
      (slide) => slide.documentDetailId !== image.documentDetailId
    );
    this.showslider = this.bannerSlides.length > 0;
  }

  private isValidBanner(image: IDashboardImages | null | undefined): boolean {
    if (!image?.documentDetailId || !image?.fileExtenstion) {
      return false;
    }
    return Boolean(this.imgPath?.trim());
  }

  logout(): void {
    this.authservice.logout();
  }
}
