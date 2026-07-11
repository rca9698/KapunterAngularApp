import { Injectable } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { apiService } from 'src/app/api.service';
import { AdminCreateIdComponent } from './admin-create-id/admin-create-id.component';
import { IID_Request_Modal } from 'src/app/Shared/Modals/Ids/id-request-modal';

@Injectable({
  providedIn: 'root'
})
export class IdsService {
  bsmodalRef: any;
  constructor(private bsModalService: BsModalService, private apiservice: apiService) { }

  listIdRequests(obj: any) {
    return this.apiservice.listIdRequests(obj);
  }

  /** GET /ids/list-ids → POST /api/Account/GetIDs */
  listIds(obj: any) {
    return this.apiservice.GetIDs(obj);
  }

  /** GET /ids/list-ids → POST /api/Account/GetIDs */
  listIdsByUserSite(obj: any) {
    return this.apiservice.GetIDsByUserSite(obj);
  }

  /** GET /ids/change-password-requests → POST /api/Account/ListIDChangePassword */
  listChangePasswordRequests(obj: any) {
    return this.apiservice.ListIDChangePassword(obj);
  }

  /** GET /ids/close-id-requests → POST /api/Account/ListIDCloseRequest */
  listCloseIdRequests(obj: any) {
    return this.apiservice.ListIDCloseRequest(obj);
  }

  /** GET /ids/rejected-id-requests → POST /api/Account/RejectedRequestList */
  listRejectedIdRequests(obj: any) {
    return this.apiservice.RejectedRequestList(obj);
  }

  idRequestDetails(accountRequestId: bigint) {
    return this.apiservice.IDRequestDetails(accountRequestId);
  }

  confirmChangePassword(obj: any) {
    return this.apiservice.ConfirmChangeIDPassword(obj);
  }

  confirmCloseId(obj: any) {
    return this.apiservice.ConfirmCloseID(obj);
  }

  addCloseId(obj: any) {
    return this.apiservice.AddCloseID(obj);
  }

  AdminAddIDPopup(obj: IID_Request_Modal) {
    const initalstate: ModalOptions = {
      initialState: {
        obj
      }
    };
    this.bsmodalRef?.hide();
    this.bsmodalRef = this.bsModalService.show(AdminCreateIdComponent, initalstate);
  }

  AdminAddID(obj: any) {
    return this.apiservice.AddID(obj);
  }

  deletedIdRequests(obj: any) {
    return this.apiservice.listIdRequests({ ...obj, isDeleted: 1 });
  }

  deletedIds(obj: any) {
    return this.apiservice.GetIDs({ ...obj, isDeleted: 1 });
  }

  addTransferIDRequest(obj: any) {
    return this.apiservice.AddTransferIDRequest(obj);
  }

  listTransferIDRequests(obj: any) {
    return this.apiservice.ListTransferIDRequests(obj);
  }

  listTransferIDHistory(obj: any) {
    return this.apiservice.ListTransferIDHistory(obj);
  }

  confirmTransferIDRequest(obj: any) {
    return this.apiservice.ConfirmTransferIDRequest(obj);
  }
}
