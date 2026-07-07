import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AddImageComponent } from './Add-Image/add-image.component';
import { environment } from 'src/environments/environment';
import { apiService } from '../api.service';
import { DeletImageComponent } from './delet-image/delet-image.component';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  list_Images() {
    return this.apiservice.GetDashboardImages();
  }
  
  bsmodalRef?: BsModalRef;

  constructor(private bsModalService:BsModalService,private http: HttpClient, private apiservice: apiService) { }

  OpenAddImagePopup(title: string){
    const initalstate: ModalOptions = {
      initialState:{
        title
      }
    }
    this.bsmodalRef = this.bsModalService.show(AddImageComponent,initalstate);
  }

  add_dashbord_image(formParams: any){
    return this.apiservice.AddDashboardImage(formParams);
  }

  setDefaultImage(imageId: any) {
    return this.apiservice.SetDefaultDashboardImage(imageId);
  }

OpenDeletmagePopup(title: string){
    const initalstate: ModalOptions = {
      initialState:{
        title
      }
    }
    this.bsmodalRef = this.bsModalService.show(DeletImageComponent,initalstate);
  }

  deleteImage(imageId: any) {
    return this.apiservice.DeleteDashboardImages(imageId);
  }

  downloadDepositQAImage() {
    return this.http.get(`${environment.apiUrl}/api/dashboard/download-qa-template`, {
      responseType: 'blob'
    });
  }

}
