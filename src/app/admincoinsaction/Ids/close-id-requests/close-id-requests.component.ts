import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { IID_Request_Modal } from 'src/app/Shared/Modals/Ids/id-request-modal';
import { IdsService } from '../ids.service';

@Component({
  selector: 'app-close-id-requests',
  templateUrl: './close-id-requests.component.html',
  styleUrls: ['./close-id-requests.component.css']
})
export class CloseIdRequestsComponent implements OnInit {
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
    this.fetchCloseRequests(this.usersQuery);
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

  approveClose(item: IID_Request_Modal): void {
    const accountId = (item as any).accountId ?? (item as any).accountID;
    this.idsService.confirmCloseId({
      accountId,
      sessionUser: this._sessionUser
    }).subscribe({
      next: (response: any) => {
        this.returnType = response;
        if (this.returnType?.returnStatus === 1) {
          this.toasterService.success(this.returnType?.returnMessage ?? 'Request approved');
          this.fetchCloseRequests(this.usersQuery);
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
    this.fetchCloseRequests(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
