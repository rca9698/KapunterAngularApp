import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { IID_Request_Modal } from 'src/app/Shared/Modals/Ids/id-request-modal';
import { IdsService } from '../ids.service';

@Component({
  selector: 'app-change-password-requests',
  templateUrl: './change-password-requests.component.html',
  styleUrls: ['./change-password-requests.component.css']
})
export class ChangePasswordRequestsComponent implements OnInit {
  private readonly _sessionUser: bigint;
  usersQuery: any = {};
  requestList: IID_Request_Modal[] = [];
  returnType: any;
  paginationCount = 1;
  totalCount = 0;

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
      userId: this._sessionUser,
      sessionUser: this._sessionUser
    };
    this.fetchChangePasswordRequests(this.usersQuery);
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
    this.usersQuery.userId = this._sessionUser;
    this.usersQuery.sessionUser = this._sessionUser;
    this.fetchChangePasswordRequests(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
