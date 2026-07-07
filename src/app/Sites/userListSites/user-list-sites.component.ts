import { Component, OnInit } from '@angular/core';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { SitesService } from '../../Sites/sites.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth.service';
import { UserIdsService } from 'src/app/userids/user-ids.service';
import { CoinsService } from 'src/app/admincoinsaction/coins/coins.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TransferIdsListModalComponent } from './transfer-ids-list-modal/transfer-ids-list-modal.component';
import { SiteIdDetailsModalComponent } from './site-id-details-modal/site-id-details-modal.component';

@Component({
  selector: 'app-user-list-sites',
  templateUrl: './user-list-sites.component.html',
  styleUrls: ['./user-list-sites.component.css']
})
export class UserListSitesComponent implements OnInit {

  site: ISiteDetailModal = {} as ISiteDetailModal;
  sites: ISiteDetailModal[] | undefined;
  sitePath: string | undefined;
  listSitesQuery: any;
  returnType: any; 
  private readonly _sessionUser: any;
  
  constructor(private siteService:SitesService, 
    private toasterService: ToastrService, private userIdService: UserIdsService
    , public authservice: AuthService, private coinsservice: CoinsService
    , private bsModalService: BsModalService){
    this.sitePath = environment.imagePath.sitePath;
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites(){
    this.listSitesQuery = {
      SessionUser: this._sessionUser
    };
     this.siteService.getSiteList(this.listSitesQuery).subscribe(resp => {
      this.returnType = resp;
      if(this.returnType['returnStatus'] == 1){
        this.sites = this.returnType['returnList'];
      }else{
        this.toasterService.warning(this.returnType.returnMessage);
      }
    })
  }

  CreateIDRequest(obj: any){
    this.userIdService.OpenAddIDRequestPopup(obj);
  }

  openWithdrawCoinsRequest(obj: any): void {
    this.coinsservice.OpenWithdrawCoinsRequestPopup('Withdraw', this.site);
  }

  openDepositeCoinsRequest(obj: any): void {
    this.coinsservice.OpenDepositeCoinsRequestPopup('Deposite', this.site);
  }

  openTransferIdsList(site: ISiteDetailModal): void {
    const initialState: ModalOptions = {
      initialState: { contextSite: site },
    };
    this.bsModalService.show(TransferIdsListModalComponent, initialState);
  }

  openSiteIdDetails(site: ISiteDetailModal): void {
    const initialState: ModalOptions = {
      initialState: { contextSite: site },
    };
    this.bsModalService.show(SiteIdDetailsModalComponent, initialState);
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

}
