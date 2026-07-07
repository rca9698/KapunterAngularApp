import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AddSiteComponent } from './addSite/add-site.component';
import { environment } from 'src/environments/environment';
import { ISiteDetailModal, SiteDetailModal  } from '../Shared/Modals/site-detail-modal';
import { apiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class SitesService {
  bsmodalRef?: BsModalRef;
  constructor(private bsModalService:BsModalService,private http: HttpClient
    , private apiservice: apiService) { }

OpenAddSitePopup(isupdate: boolean, site: ISiteDetailModal){
  const initalstate: ModalOptions = {
    initialState:{
      isupdate,
      site 
    }
  }
  console.log('add site')
  this.bsmodalRef?.hide();
  this.bsmodalRef = this.bsModalService.show(AddSiteComponent,initalstate);
}

public getSiteList(listSitesQuery: any){
  return this.apiservice.GetSites(listSitesQuery)
}

public GetUserListSiteById(sessionUser: any){
  return this.apiservice.GetUserListSiteById(sessionUser)
}

/**
 * Get active account sites for specific userId from API endpoint: GetUserListSiteById/{userId}
 */
public getUserSitesById(userId: string | number){
  return this.apiservice.GetUserListSiteById(userId as any);
}

public uploadfile(formParams: any) {
   return this.apiservice.AddSite(formParams);
}

public deleteSite(site: any){
  return this.apiservice.DeleteSite(site)
}

}
