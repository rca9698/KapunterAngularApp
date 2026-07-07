import { Component } from '@angular/core';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { SitesService } from 'src/app/Sites/sites.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { UserIdsService } from '../user-ids.service';

@Component({
  selector: 'app-list-user-ids',
  templateUrl: './list-user-ids.component.html',
  styleUrls: ['./list-user-ids.component.css']
})
export class ListUserIdComponent {
  
  sites: ISiteDetailModal[] | undefined;
  sitePath: string | undefined;
  listSitesQuery: any;
  returnType: any; 
  private readonly _sessionUser: any; 
  
  constructor(private siteService:SitesService, private useridsservice: UserIdsService,
    private toasterService: ToastrService, private authservice: AuthService){
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
     this.siteService.GetUserListSiteById(this._sessionUser).subscribe(resp => {
      this.returnType = resp;
      if(this.returnType['returnStatus'] == 1){
        this.sites = this.returnType['returnList'];
      }else{
        this.toasterService.warning(this.returnType.returnMessage);
      }
    })
  }

  DepositeCoinsToIDPopup(obj: any){
    console.log(obj);
    this.useridsservice.OpenDepositeCoinsToIDPopup(obj);
  }

  WithdrawCoinsFromIDPopup(obj: any){
    this.useridsservice.OpenWithdrawCoinsFromIdPopup(obj);
  }

}
