import { Component } from '@angular/core';
import { SitesService } from '../Sites/sites.service';
import { ISiteDetailModal, SiteDetailModal } from '../Shared/Modals/site-detail-modal';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastrService } from '../toastr/toastr.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  site:ISiteDetailModal = new SiteDetailModal();
  constructor(private siteService: SitesService, private router: Router
    , public authservice: AuthService, private toasterService: ToastrService){
  }

  RedirectToHome(){
    this.router.navigate(['/']);
  }

  AddSitesPopup(){
    if(this.authservice.isadminview()){
      this.siteService.OpenAddSitePopup(false,this.site);
    }else{
      this.toasterService.warning('Login to perform action!!');
    }
  }
  
  createId(){
    if(this.authservice.isbenview()){
    this.router.navigate(["/site/user-list-sites"]);
    }else{
      this.toasterService.warning('Login to perform action!!');
    }
  }

  listIds(){
    if(this.authservice.isbenview()){
      this.router.navigate(["/site/app-get-user-list-site-by-id"]);
    }else{
      this.toasterService.warning('Login to perform action!!');
    }
  }

  viewPassbook(){
    if(this.authservice.isbenview()){
     this.router.navigate(["/passbook/passbook-view-panel"]);
    }else{
      this.toasterService.warning('Login to perform action!!');
    }
  }

}
