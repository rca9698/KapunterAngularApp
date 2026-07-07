import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { apiService } from 'src/app/api.service';
import { DeleteModuleComponent } from './delete-module.component';

@Injectable({
  providedIn: 'root'
})
export class DeleteService {

  bsmodalRef?: BsModalRef;
  constructor(private bsModalService:BsModalService,private http: HttpClient
    , private apiservice: apiService) { }

OpenDeletePopup(deleteType: string, title: string, obj: any){
  const initalstate: ModalOptions = {
    initialState:{
      deleteType,
      title,
      obj 
    }
  }
  console.log(deleteType);
  this.bsmodalRef?.hide();
  this.bsmodalRef = this.bsModalService.show(DeleteModuleComponent,initalstate);
}
}
