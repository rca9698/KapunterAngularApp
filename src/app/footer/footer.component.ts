import { Component, OnInit } from '@angular/core';
import { SitesService } from '../Sites/sites.service';
import { ISiteDetailModal, SiteDetailModal } from '../Shared/Modals/site-detail-modal';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastrService } from '../toastr/toastr.service';
import { PassbookUnreadService } from '../Shared/passbook-unread/passbook-unread.service';
import { filter } from 'rxjs/operators';
import { getApkDownloadUrl, isNativeApp } from '../Shared/platform/platform.util';
import { AppShareService } from '../Shared/platform/app-share.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  site: ISiteDetailModal = new SiteDetailModal();
  readonly isNativeApp = isNativeApp();
  private currentUrl = '';

  constructor(
    private siteService: SitesService,
    private router: Router,
    public authservice: AuthService,
    private toasterService: ToastrService,
    public passbookUnread: PassbookUnreadService,
    private appShareService: AppShareService
  ) {}

  ngOnInit(): void {
    this.currentUrl = this.router.url || '';
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl = e.urlAfterRedirects || e.url || '';
      });
  }

  isHomeActive(): boolean {
    return this.currentUrl === '/' || this.currentUrl.startsWith('/?');
  }

  isIdsActive(): boolean {
    return this.currentUrl.includes('/site/app-get-user-list-site-by-id');
  }

  isShareActive(): boolean {
    return this.currentUrl.includes('/account/refer-earn');
  }

  isPassbookActive(): boolean {
    return this.currentUrl.includes('/passbook/');
  }

  RedirectToHome() {
    this.router.navigate(['/']);
  }

  AddSitesPopup() {
    if (this.authservice.isadminview()) {
      this.siteService.OpenAddSitePopup(false, this.site);
    } else {
      this.toasterService.warning('Login to perform action!!');
    }
  }

  createId() {
    if (!this.authservice.isbenview()) {
      this.toasterService.warning('Login to perform action!!');
      return;
    }
    this.router.navigate(['/site/app-get-user-list-site-by-id'], { queryParams: { view: 'create' } });
  }

  listIds() {
    if (!this.authservice.isbenview()) {
      this.toasterService.warning('Login to perform action!!');
      return;
    }
    this.router.navigate(['/site/app-get-user-list-site-by-id'], { queryParams: { view: 'active' } });
  }

  viewPassbook() {
    if (this.authservice.isbenview()) {
      this.router.navigate(['/passbook/passbook-view-panel']);
    } else {
      this.toasterService.warning('Login to perform action!!');
    }
  }

  viewShareBonus() {
    if (this.authservice.isbenview()) {
      this.router.navigate(['/account/refer-earn']);
    } else {
      this.toasterService.warning('Login to perform action!!');
    }
  }

  viewBonus() {
    if (this.authservice.isbenview()) {
      this.router.navigate(['/setting/bonus']);
    } else {
      this.toasterService.warning('Login to perform action!!');
    }
  }

  downloadAndroidApp(): void {
    if (this.isNativeApp) {
      return;
    }
    window.open(getApkDownloadUrl(), '_blank', 'noopener');
  }

  shareApp(): void {
    void this.appShareService.shareKapunterApp();
  }
}
