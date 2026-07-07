import { Injectable } from '@angular/core';
import { ToastrService } from './toastr/toastr.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
 
  returnValue: any;
  returnStatus: any;  
  
  constructor(public bsModalRef:BsModalRef,private toasterService: ToastrService) {

   }


   toastrMessages(returnType: any){
    this.returnStatus = returnType['returnStatus']; 
    if(this.returnStatus == 1){
      this.toasterService.success(returnType['returnMessage']);
    }else{
      this.toasterService.warning(returnType['returnMessage']);
    }
    this.bsModalRef.hide();

     window.location.reload();
  }
  
}
