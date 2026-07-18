import { Injectable } from '@angular/core';
import { ToastrService } from './toastr/toastr.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PageRefreshService } from './Shared/Utils/page-refresh.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
 
  returnValue: any;
  returnStatus: any;  
  
  constructor(public bsModalRef:BsModalRef,private toasterService: ToastrService,
    private pageRefresh: PageRefreshService) {

   }


   toastrMessages(returnType: any){
    this.returnStatus = returnType?.['returnStatus'] ?? returnType?.['ReturnStatus'];
    const message = returnType?.['returnMessage'] ?? returnType?.['ReturnMessage'] ?? '';
    if (Number(this.returnStatus) === 1) {
      this.toasterService.success(message || 'Saved successfully.');
      try {
        this.bsModalRef?.hide();
      } catch {
        // root-injected modal ref may be inactive; callers still hide their own modal
      }
      this.pageRefresh.refreshCurrentRoute();
    } else {
      this.toasterService.warning(message || 'Unable to complete the request.');
    }
  }
  
}
