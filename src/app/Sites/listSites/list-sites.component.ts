import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SitesService } from '../sites.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { ISiteDetailModal, SiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { AuthService } from 'src/app/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-sites',
  templateUrl: './list-sites.component.html',
  styleUrls: ['./list-sites.component.css']
})
export class ListSitesComponent implements OnInit {

  sites: ISiteDetailModal[] = [];
  sitePath: string | undefined;
  loading = true;
  listSitesQuery: any;
  returnType: any;
  private readonly _sessionUser: any;
  private readonly _emptySite = new SiteDetailModal(); 

  constructor(private siteService:SitesService, 
    private toasterService: ToastrService, private deleteService:DeleteService
    , private authservice: AuthService, private router:Router){
    this.sitePath = environment.imagePath.sitePath;
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites() {
    this.loading = true;
    this.listSitesQuery = {
      SessionUser: this._sessionUser
    };
    this.siteService.getSiteList(this.listSitesQuery).subscribe({
      next: (resp) => {
        this.returnType = resp;
        if (this.returnType['returnStatus'] == 1) {
          this.sites = this.returnType['returnList'] ?? [];
        } else {
          this.sites = [];
          this.toasterService.warning(this.returnType.returnMessage);
        }
        this.loading = false;
      },
      error: () => {
        this.sites = [];
        this.loading = false;
        this.toasterService.warning('Unable to load sites. Please try again.');
      }
    });
  }

  addSite() {
    this.siteService.OpenAddSitePopup(false, this._emptySite);
  }

  trackBySiteId(_index: number, site: ISiteDetailModal): number {
    return site.siteId;
  }

  deleteSitePopup(site: ISiteDetailModal){
    this.deleteService.OpenDeletePopup('site','Site',site);
  }

  updateSite(site: ISiteDetailModal){
    this.siteService.OpenAddSitePopup(true,site)
  }
}
