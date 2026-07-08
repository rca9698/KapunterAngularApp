import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { IID_Request_Modal } from 'src/app/Shared/Modals/Ids/id-request-modal';
import { IdsService } from '../ids.service';
import { environment } from 'src/environments/environment';
import { resolveAccountRequestId } from '../../shared/id-request.util';

@Component({
  selector: 'app-rejected-id-requests',
  templateUrl: './rejected-id-requests.component.html',
  styleUrls: ['./rejected-id-requests.component.css', '../../shared/admin-listing.shared.css']
})
export class RejectedIdRequestsComponent implements OnInit {
  private readonly _sessionUser: bigint;
  usersQuery: any = {};
  requestList: IID_Request_Modal[] = [];
  returnType: any;
  paginationCount = 1;
  totalCount = 0;
  sitePath = environment.imagePath.sitePath;

  constructor(
    private idsService: IdsService,
    private authservice: AuthService,
    private toasterService: ToastrService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.usersQuery = {
      pageNumber: 1,
      userId: 0,
      sessionUser: this._sessionUser
    };
    this.fetchRejectedRequests(this.usersQuery);
  }

  getRequestId(item: IID_Request_Modal): string {
    return resolveAccountRequestId(item as unknown as Record<string, unknown>);
  }

  fetchRejectedRequests(paginationQuery: any): void {
    this.idsService.listRejectedIdRequests(paginationQuery).subscribe({
      next: (response) => {
        this.returnType = response;
        this.requestList = this.returnType['returnList'] ?? [];
        this.paginationCount = this.returnType['paginationCount'] ?? 1;
        this.totalCount = this.returnType['totalCount'] ?? 0;
      },
      error: (error) => console.error(error)
    });
  }

  viewRequest(item: IID_Request_Modal): void {
    const requestId = (item as any).accountRequestId ?? (item as any).accountRequestID;
    if (!requestId) {
      this.toasterService.warning('Request ID not available.');
      return;
    }
    this.idsService.idRequestDetails(requestId).subscribe({
      next: (response: any) => {
        const detail = response?.returnVal;
        if (response?.returnStatus === 1 && detail) {
          const msg = [
            `Request #${this.getRequestId(item)}`,
            `User: ${detail.userNumber ?? item.userNumber}`,
            `Site: ${detail.siteName ?? item.siteName}`,
            `ID: ${detail.userName ?? item.userName}`,
            detail.rejectionReason ? `Reason: ${detail.rejectionReason}` : ''
          ].filter(Boolean).join('\n');
          this.toasterService.success(msg);
        } else {
          this.toasterService.warning(response?.returnMessage ?? 'Details not available');
        }
      },
      error: () => this.toasterService.warning('Unable to load request details')
    });
  }

  PaginationNumber(pageNumber: number): void {
    this.usersQuery.pageNumber = pageNumber;
    this.usersQuery.userId = 0;
    this.usersQuery.sessionUser = this._sessionUser;
    this.fetchRejectedRequests(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
