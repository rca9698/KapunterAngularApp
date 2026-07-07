import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { apiService } from 'src/app/api.service';
import { ViewImageModuleComponent } from './view-image-module.component';

@Injectable({
  providedIn: 'root'
})
export class ViewImageService {
  bsmodalRef?: BsModalRef;
  constructor(private bsModalService:BsModalService, private apiservice: apiService) { }

OpenViewImagePopup(Path: string, title: string, obj: any){
  console.log(obj,'obj in view image service');
  const initalstate: ModalOptions = {
    initialState:{
      path: Path,
      title,
      obj 
    }
  }
  this.bsmodalRef?.hide();
  this.bsmodalRef = this.bsModalService.show(ViewImageModuleComponent, initalstate);
}
}
