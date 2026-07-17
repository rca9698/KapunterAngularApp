import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SitesService } from './Sites/sites.service';
import { ISiteDetailModal, SiteDetailModal } from './Shared/Modals/site-detail-modal'
import { DashboardService } from './Dashboard/dashboard.service';
import { AuthService } from './auth.service';
import { AccountsService } from './Accounts/accounts.service';
import { UserService } from './admincoinsaction/User/user.service';
import { VisitorCountService } from './visitor-count.service';
import { LoaderService } from './Shared/loader/loader.service';
import { ReferralService } from './Accounts/Profile/refer-earn/referral.service';
import { apiService } from './api.service';
import { DeploymentBannerService, DeploymentBannerState } from './deployment-banner.service';
import { PassbookUnreadService } from './Shared/passbook-unread/passbook-unread.service';
import { ToastrService } from './toastr/toastr.service';
import { getApkDownloadUrl, getPublicAppUrl, isNativeApp } from './Shared/platform/platform.util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'kapunter.client';
  userDetailQuery: any;
  returnType: any;
  private readonly _sessionUser: any;
  site: ISiteDetailModal = new SiteDetailModal();
  private routerSub?: Subscription;
  private authSub?: Subscription;
  private bannerSub?: Subscription;
  idsMenuOpen = false;

  pnlLoaded = false;
  deposit7 = 0;
  deposit30 = 0;
  withdraw7 = 0;
  withdraw30 = 0;
  totalDeposit = 0;
  totalWithdraw = 0;
  deploymentBanner: DeploymentBannerState = {
    enabled: false,
    title: '',
    message: '',
    hint: '',
    leftImage: 'assets/deployment-banner-hero.svg',
    rightImage: 'assets/deployment-banner-server.svg',
  };

  constructor(
    private siteService: SitesService,
    private dashboardService: DashboardService,
    public authService: AuthService,
    public accountService: AccountsService,
    private userservice: UserService,
    public visitorCountService: VisitorCountService,
    private router: Router,
    private loaderService: LoaderService,
    private referralService: ReferralService,
    private api: apiService,
    private deploymentBannerService: DeploymentBannerService,
    _passbookUnread: PassbookUnreadService,
    private toasterService: ToastrService
  ) {
    this._sessionUser = authService.user.userId;
  }

  ngOnInit(): void {
    this.deploymentBannerService.start();
    this.bannerSub = this.deploymentBannerService.state$.subscribe((state) => {
      this.deploymentBanner = state;
      document.body.classList.toggle('deployment-cover-open', !!state.enabled);
    });

    this.authService.captureReferralFromUrl();
    this.referralService.loadRewardAmount();

    if (this.referralService.pendingCode && !this.authService.isLoggedIn) {
      setTimeout(() => this.accountService.OpenLoginPopup(true, 'Login to claim invite'), 500);
    }

    this.idsMenuOpen = this.router.url.includes('/site/app-get-user-list-site-by-id');

    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loaderService.setRouteLoading(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loaderService.setRouteLoading(false);
        if (event instanceof NavigationEnd) {
          this.authService.captureReferralFromUrl();
          if (event.urlAfterRedirects.includes('/site/app-get-user-list-site-by-id')) {
            this.idsMenuOpen = true;
          }
        }
      }
    });

    this.authSub = this.authService.isLoggenIn.subscribe((loggedIn) => {
      if (loggedIn && this.authService.isbenview()) {
        this.loadPnLStats();
      } else {
        this.pnlLoaded = false;
      }
    });

    if (this.authService.isLoggedIn && this.authService.isbenview()) {
      this.loadPnLStats();
    }

    this.authService.getUserDetails()?.subscribe();
    this.visitorCountService.loadStats(false, 0);
    this.visitorCountService.startAutoRefresh(180000);
  }

  get pnl7(): number {
    return this.withdraw7 - this.deposit7;
  }

  get pnl30(): number {
    return this.withdraw30 - this.deposit30;
  }

  get pnlTotal(): number {
    return this.totalWithdraw - this.totalDeposit;
  }

  loadPnLStats(): void {
    this.api.getMyDepositStats().subscribe({
      next: (resp: any) => {
        const val = resp?.returnVal ?? resp?.ReturnVal ?? {};
        this.deposit7 = Number(val.depositLast7Days ?? val.DepositLast7Days ?? 0);
        this.deposit30 = Number(val.depositLast30Days ?? val.DepositLast30Days ?? 0);
        this.withdraw7 = Number(val.withdrawLast7Days ?? val.WithdrawLast7Days ?? 0);
        this.withdraw30 = Number(val.withdrawLast30Days ?? val.WithdrawLast30Days ?? 0);
        this.totalDeposit = Number(val.totalDeposit ?? val.TotalDeposit ?? 0);
        this.totalWithdraw = Number(val.totalWithdraw ?? val.TotalWithdraw ?? 0);
        this.pnlLoaded = true;
      },
      error: () => {
        this.pnlLoaded = false;
      }
    });
  }

  pnlLabel(value: number): string {
    if (value > 0) return 'Profit';
    if (value < 0) return 'Loss';
    return 'Even';
  }

  pnlTone(value: number): 'profit' | 'loss' | 'even' {
    if (value > 0) return 'profit';
    if (value < 0) return 'loss';
    return 'even';
  }

  formatPnLMoney(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(value ?? 0));
  }

  toggleIdsMenu(): void {
    this.idsMenuOpen = !this.idsMenuOpen;
  }

  isIdsView(view: 'active' | 'create' | 'closed'): boolean {
    const tree = this.router.parseUrl(this.router.url);
    if (!this.router.url.includes('/site/app-get-user-list-site-by-id')) {
      return false;
    }
    const current = (tree.queryParams['view'] || 'active').toLowerCase();
    return current === view;
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.authSub?.unsubscribe();
    this.bannerSub?.unsubscribe();
    document.body.classList.remove('deployment-cover-open');
    this.visitorCountService.stopAutoRefresh();
  }

  AddSitesPopup() {
    this.siteService.OpenAddSitePopup(false, this.site);
  }

  OpenAddImagePopup() {
    this.dashboardService.OpenAddImagePopup('Add Image');
  }

  loginPopup() {
    this.accountService.OpenLoginPopup(true, 'Login');
  }

  logoutSeesion() {
    this.authService.logout();
  }

  /** Web browser only — native app hides Download and shows Share alone. */
  readonly isNativeApp = isNativeApp();

  /** Share the public web URL (works from browser and native app). */
  async shareAppLink(): Promise<void> {
    const url = getPublicAppUrl();
    const title = 'Kapunter';
    const text = 'Join Kapunter — open on web or install the app: ' + url;

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {
      // User cancelled share sheet — ignore
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        this.toasterService.success('App link copied');
        return;
      }
    } catch {
      // fall through
    }

    window.prompt('Copy this link to share Kapunter:', url);
  }

  /** Web only: download the hosted Android APK. */
  downloadAndroidApp(): void {
    if (this.isNativeApp) {
      return;
    }
    const apkUrl = getApkDownloadUrl();
    window.open(apkUrl, '_blank', 'noopener');
  }
}
