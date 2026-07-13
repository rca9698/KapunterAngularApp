import { Component, OnInit } from '@angular/core';
import { SitesService } from '../Sites/sites.service';
import { ISiteDetailModal, SiteDetailModal } from '../Shared/Modals/site-detail-modal';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastrService } from '../toastr/toastr.service';
import { IdsService } from '../admincoinsaction/Ids/ids.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  site: ISiteDetailModal = new SiteDetailModal();
  /** When true, footer shows My IDs; otherwise Create (toggle). */
  hasActiveIds = false;

  constructor(
    private siteService: SitesService,
    private router: Router,
    public authservice: AuthService,
    private toasterService: ToastrService,
    private idsService: IdsService
  ) {}

  ngOnInit(): void {
    this.refreshActiveIdsFlag();
  }

  refreshActiveIdsFlag(): void {
    if (!this.authservice.isbenview()) {
      this.hasActiveIds = false;
      return;
    }
    const userId = this.authservice.user?.userId;
    if (!userId) {
      this.hasActiveIds = false;
      return;
    }
    this.idsService.listIds({ userId, sessionUser: userId, isDeleted: 0 }).subscribe({
      next: (resp: any) => {
        const list = resp?.returnList ?? resp?.ReturnList ?? [];
        this.hasActiveIds = Array.isArray(list) && list.length > 0;
      },
      error: () => {
        this.hasActiveIds = false;
      }
    });
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

  /** Single footer slot: Create when no active IDs, My IDs when any exist. */
  idsWorkspace() {
    if (!this.authservice.isbenview()) {
      this.toasterService.warning('Login to perform action!!');
      return;
    }
    const userId = this.authservice.user?.userId;
    if (!userId) {
      this.router.navigate(['/site/app-get-user-list-site-by-id'], { queryParams: { view: 'create' } });
      return;
    }
    this.idsService.listIds({ userId, sessionUser: userId, isDeleted: 0 }).subscribe({
      next: (resp: any) => {
        const list = resp?.returnList ?? resp?.ReturnList ?? [];
        this.hasActiveIds = Array.isArray(list) && list.length > 0;
        this.router.navigate(['/site/app-get-user-list-site-by-id'], {
          queryParams: { view: this.hasActiveIds ? 'active' : 'create' }
        });
      },
      error: () => {
        this.hasActiveIds = false;
        this.router.navigate(['/site/app-get-user-list-site-by-id'], { queryParams: { view: 'create' } });
      }
    });
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

  viewBonus() {
    if (this.authservice.isbenview()) {
      this.router.navigate(['/setting/bonus']);
    } else {
      this.toasterService.warning('Login to perform action!!');
    }
  }
}
