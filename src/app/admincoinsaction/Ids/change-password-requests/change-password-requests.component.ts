import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { IID_Request_Modal } from 'src/app/Shared/Modals/Ids/id-request-modal';
import { IdsService } from '../ids.service';
import { environment } from 'src/environments/environment';
import { resolveAccountId } from '../../shared/id-request.util';

@Component({
  selector: 'app-change-password-requests',
  templateUrl: './change-password-requests.component.html',
  styleUrls: ['./change-password-requests.component.css', '../../shared/admin-listing.shared.css']
})
export class ChangePasswordRequestsComponent implements OnInit {
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
    this.fetchChangePasswordRequests(this.usersQuery);
  }

  getAccountId(item: IID_Request_Modal): string {
    return resolveAccountId(item as unknown as Record<string, unknown>);
  }

  fetchChangePasswordRequests(paginationQuery: any): void {
    this.idsService.listChangePasswordRequests(paginationQuery).subscribe({
      next: (response) => {
        this.returnType = response;
        this.requestList = this.returnType['returnList'] ?? [];
        this.paginationCount = this.returnType['paginationCount'] ?? 1;
        this.totalCount = this.returnType['totalCount'] ?? 0;
      },
      error: (error) => console.error(error)
    });
  }

  approveChangePassword(item: IID_Request_Modal): void {
    const accountId = (item as any).accountId ?? (item as any).accountID;
    const password = (item as any).password ?? '';
    this.idsService.confirmChangePassword({
      accountId,
      password,
      sessionUser: this._sessionUser
    }).subscribe({
      next: (response: any) => {
        this.returnType = response;
        if (this.returnType?.returnStatus === 1) {
          this.toasterService.success(this.returnType?.returnMessage ?? 'Password change approved');
          this.fetchChangePasswordRequests(this.usersQuery);
        } else {
          this.toasterService.warning(this.returnType?.returnMessage ?? 'Unable to approve request');
        }
      },
      error: () => this.toasterService.warning('Unable to approve request')
    });
  }

  PaginationNumber(pageNumber: number): void {
    this.usersQuery.pageNumber = pageNumber;
    this.usersQuery.userId = 0;
    this.usersQuery.sessionUser = this._sessionUser;
    this.fetchChangePasswordRequests(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
