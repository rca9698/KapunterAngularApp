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
import { ActivitySnapshotService } from './Shared/activity-snapshot/activity-snapshot.service';
import { ToastrService } from './toastr/toastr.service';
import { getApkDownloadUrl, getPublicAppUrl, isNativeApp } from './Shared/platform/platform.util';
import { AppUpdateService, AppUpdateUiState } from './Shared/platform/app-update.service';
import { AppShareService, ShareSheetState, KAPUNTER_SHARE_TARGETS, ShareTarget } from './Shared/platform/app-share.service';
import { NotificationCenterService } from './Shared/notification-center/notification-center.service';

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
  private updateSub?: Subscription;
  private shareSub?: Subscription;
  idsMenuOpen = false;

  pnlLoaded = false;
  deposit7 = 0;
  deposit30 = 0;
  withdraw7 = 0;
  withdraw30 = 0;
  totalDeposit = 0;
  totalWithdraw = 0;
  appUpdate: AppUpdateUiState = {
    visible: false,
    downloading: false,
    progress: 0,
    message: '',
    versionName: '',
    releaseNotes: '',
    forceUpdate: false,
    error: '',
  };
  shareSheet: ShareSheetState = { open: false, payload: null };
  readonly shareTargets: ShareTarget[] = KAPUNTER_SHARE_TARGETS;
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
    // Eager-construct the shared poller (single SP) so tracker / passbook / visitor stats share one call.
    _activitySnapshot: ActivitySnapshotService,
    private toasterService: ToastrService,
    private appUpdateService: AppUpdateService,
    private appShareService: AppShareService,
    public notifications: NotificationCenterService
  ) {
    this._sessionUser = authService.user.userId;
  }

  ngOnInit(): void {
    this.deploymentBannerService.start();
    this.bannerSub = this.deploymentBannerService.state$.subscribe((state) => {
      this.deploymentBanner = state;
      document.body.classList.toggle('deployment-cover-open', !!state.enabled);
    });

    this.updateSub = this.appUpdateService.ui$.subscribe((state) => {
      this.appUpdate = state;
    });
    this.shareSub = this.appShareService.sheet$.subscribe((state) => {
      this.shareSheet = state;
    });
    // Delay slightly so first paint / config settle before network check
    setTimeout(() => {
      void this.appUpdateService.checkOnLaunch();
    }, 1200);

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

  get playHighlight(): string {
    if (this.totalWithdraw > 0 && this.totalWithdraw >= this.totalDeposit) {
      return 'Nice cashouts — keep the streak going';
    }
    if (this.totalWithdraw > 0) {
      return 'Cashouts are rolling — stay in the game';
    }
    if (this.totalDeposit > 0) {
      return 'Funds added — you are ready to play';
    }
    return 'Start with a deposit and track every move here';
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
    this.updateSub?.unsubscribe();
    this.shareSub?.unsubscribe();
    document.body.classList.remove('deployment-cover-open');
    this.visitorCountService.stopAutoRefresh();
  }

  startAppUpdate(): void {
    void this.appUpdateService.startUpdate();
  }

  dismissAppUpdate(): void {
    this.appUpdateService.dismiss();
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

  /** True inside Capacitor Android / iOS shell. */
  readonly isNativeApp = isNativeApp();

  /** Share Kapunter via WhatsApp, Telegram, and other installed apps. */
  async shareAppLink(): Promise<void> {
    await this.appShareService.shareKapunterApp();
  }

  closeShareSheet(): void {
    this.appShareService.closeSheet();
  }

  shareVia(targetId: string): void {
    void this.appShareService.shareViaTarget(targetId);
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
