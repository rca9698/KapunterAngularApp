import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { IID_Request_Modal } from 'src/app/Shared/Modals/Ids/id-request-modal';
import { IdsService } from '../ids.service';
import { environment } from 'src/environments/environment';
import { resolveAccountId } from '../../shared/id-request.util';

@Component({
  selector: 'app-close-id-requests',
  templateUrl: './close-id-requests.component.html',
  styleUrls: ['./close-id-requests.component.css', '../../shared/admin-listing.shared.css']
})
export class CloseIdRequestsComponent implements OnInit {
  private readonly _sessionUser: bigint;
  usersQuery: any = {};
  requestList: IID_Request_Modal[] = [];
  returnType: any;
  paginationCount = 1;
  totalCount = 0;
  sitePath = environment.imagePath?.sitePath || '';

  approvingAccountId: string | null = null;
  settlementAmount: number | null = null;
  approveSubmitting = false;

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
    this.fetchCloseRequests(this.usersQuery);
  }

  getAccountId(item: IID_Request_Modal): string {
    return resolveAccountId(item as unknown as Record<string, unknown>);
  }

  getCloseReason(item: IID_Request_Modal): string {
    const raw = item as unknown as Record<string, unknown>;
    const reason = raw['reason'] ?? raw['Reason'];
    const text = reason == null ? '' : String(reason).trim();
    return text || '—';
  }

  fetchCloseRequests(paginationQuery: any): void {
    this.idsService.listCloseIdRequests(paginationQuery).subscribe({
      next: (response) => {
        this.returnType = response;
        this.requestList = this.returnType['returnList'] ?? [];
        this.paginationCount = this.returnType['paginationCount'] ?? 1;
        this.totalCount = this.returnType['totalCount'] ?? 0;
      },
      error: (error) => console.error(error)
    });
  }

  startApprove(item: IID_Request_Modal): void {
    this.approvingAccountId = this.getAccountId(item);
    this.settlementAmount = null;
  }

  cancelApprove(): void {
    this.approvingAccountId = null;
    this.settlementAmount = null;
    this.approveSubmitting = false;
  }

  isApproving(item: IID_Request_Modal): boolean {
    return this.approvingAccountId === this.getAccountId(item);
  }

  confirmApprove(item: IID_Request_Modal): void {
    const accountId = this.getAccountId(item);
    const amount = Number(this.settlementAmount);

    if (this.settlementAmount === null || this.settlementAmount === undefined || Number.isNaN(amount) || amount < 0) {
      this.toasterService.warning('Enter settlement amount (0 or more) for passbook WithdrawFromAccountId.');
      return;
    }

    this.approveSubmitting = true;
    this.idsService.confirmCloseId({
      accountId,
      sessionUser: this._sessionUser,
      settlementAmount: amount
    }).subscribe({
      next: (response: any) => {
        this.approveSubmitting = false;
        this.returnType = response;
        if (this.returnType?.returnStatus === 1) {
          this.toasterService.success(this.returnType?.returnMessage ?? 'Account closed and passbook updated');
          this.cancelApprove();
          this.fetchCloseRequests(this.usersQuery);
        } else {
          this.toasterService.warning(this.returnType?.returnMessage ?? 'Unable to approve request');
        }
      },
      error: () => {
        this.approveSubmitting = false;
        this.toasterService.warning('Unable to approve request');
      }
    });
  }

  PaginationNumber(pageNumber: number): void {
    this.usersQuery.pageNumber = pageNumber;
    this.usersQuery.userId = 0;
    this.usersQuery.sessionUser = this._sessionUser;
    this.fetchCloseRequests(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
