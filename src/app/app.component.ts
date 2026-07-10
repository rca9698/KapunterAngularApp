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
  
  constructor(private siteService: SitesService, private dashboardService:DashboardService
    , public authService: AuthService, public accountService: AccountsService
    , private userservice: UserService, public visitorCountService: VisitorCountService
    , private router: Router, private loaderService: LoaderService
    , private referralService: ReferralService) {
      this._sessionUser = authService.user.userId;
  }

  ngOnInit(): void {
    this.authService.captureReferralFromUrl();
    this.referralService.loadRewardAmount();

    if (this.referralService.pendingCode && !this.authService.isLoggedIn) {
      setTimeout(() => this.accountService.OpenLoginPopup(true, 'Login to claim invite'), 500);
    }

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
        }
      }
    });

    this.authService.getUserDetails()?.subscribe();
    this.visitorCountService.loadStats(false, 0);
    // 3 minutes — enough for a live feel without heavy polling
    this.visitorCountService.startAutoRefresh(180000);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.visitorCountService.stopAutoRefresh();
  }

  AddSitesPopup(){
    this.siteService.OpenAddSitePopup(false,this.site);
  }
  
  OpenAddImagePopup(){
    this.dashboardService.OpenAddImagePopup('Add Image');
  }

  loginPopup() {
    this.accountService.OpenLoginPopup(true, 'Login');
  }
  
  logoutSeesion() {
    this.authService.logout(); 
  }
}
