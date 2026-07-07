import { Component, OnInit, OnDestroy } from '@angular/core';
import { SitesService } from './Sites/sites.service';
import { ISiteDetailModal, SiteDetailModal } from './Shared/Modals/site-detail-modal'
import { DashboardService } from './Dashboard/dashboard.service';
import { AuthService } from './auth.service';
import { AccountsService } from './Accounts/accounts.service';
import { apiService } from './api.service';
import { UserService } from './admincoinsaction/User/user.service';
import { VisitorCountService } from './visitor-count.service';

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
  
  constructor(private siteService: SitesService, private dashboardService:DashboardService
    , public authService: AuthService, public accountService: AccountsService
    , private userservice: UserService, public visitorCountService: VisitorCountService) {
      this._sessionUser = authService.user.userId;
  }

  ngOnInit(): void {
    this.authService.getUserDetails();
    this.visitorCountService.loadStats();
    this.visitorCountService.startAutoRefresh(60000);
  }

  ngOnDestroy(): void {
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
