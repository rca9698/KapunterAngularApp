import { Component, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { IdsService } from '../ids.service';
import { environment } from 'src/environments/environment';
import { ITransferIDRequestDetail } from 'src/app/Shared/Modals/Ids/transfer-id-request';
import { ApproveTransferIdModalComponent } from '../approve-transfer-id-modal/approve-transfer-id-modal.component';
import { buildSiteLogoUrl } from 'src/app/Shared/Utils/site-image.util';

@Component({
  selector: 'app-transfer-id-requests',
  templateUrl: './transfer-id-requests.component.html',
  styleUrls: ['./transfer-id-requests.component.css', '../../shared/admin-listing.shared.css']
})
export class TransferIdRequestsComponent implements OnInit {
  private readonly _sessionUser: any;
  usersQuery: any = {};
  requestList: ITransferIDRequestDetail[] = [];
  returnType: any;
  sitePath = environment.imagePath.sitePath;

  constructor(
    private idsService: IdsService,
    private authservice: AuthService,
    private toasterService: ToastrService,
    private bsModalService: BsModalService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.usersQuery = {
      pageNumber: 1,
      userId: 0,
      sessionUser: this._sessionUser
    };
    this.fetchTransferRequests();
  }

  fetchTransferRequests(): void {
    this.idsService.listTransferIDRequests(this.usersQuery).subscribe({
      next: (response) => {
        this.returnType = response;
        this.requestList = this.returnType['returnList'] ?? [];
      },
      error: () => this.toasterService.warning('Unable to load transfer requests')
    });
  }

  openApproveModal(item: ITransferIDRequestDetail): void {
    this.bsModalService.show(ApproveTransferIdModalComponent, {
      class: 'modal-dialog-centered',
      initialState: {
        request: item,
        onApproved: () => this.fetchTransferRequests(),
      },
    });
  }

  sourceAccountId(item: ITransferIDRequestDetail): number {
    return Number((item as any).sourceAccountId ?? item.sourceAccountId ?? (item as any).accountId ?? 0);
  }

  targetAccountId(item: ITransferIDRequestDetail): number {
    return Number((item as any).targetAccountId ?? item.targetAccountId ?? 0);
  }

  sourceUserName(item: ITransferIDRequestDetail): string {
    return (item as any).sourceUserName ?? (item as any).userName ?? '—';
  }

  targetUserName(item: ITransferIDRequestDetail): string {
    return (item as any).targetUserName ?? '—';
  }

  trackByReqId(_i: number, item: ITransferIDRequestDetail): number {
    return (item as any).reqId ?? _i;
  }

  siteLogoUrl(documentDetailId?: string, fileExtenstion?: string): string | null {
    return buildSiteLogoUrl(this.sitePath, documentDetailId, fileExtenstion);
  }
}
