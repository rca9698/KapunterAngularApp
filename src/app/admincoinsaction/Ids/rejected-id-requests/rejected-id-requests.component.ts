import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { IID_Request_Modal } from 'src/app/Shared/Modals/Ids/id-request-modal';
import { IdsService } from '../ids.service';

@Component({
  selector: 'app-rejected-id-requests',
  templateUrl: './rejected-id-requests.component.html',
  styleUrls: ['./rejected-id-requests.component.css']
})
export class RejectedIdRequestsComponent implements OnInit {
  private readonly _sessionUser: bigint;
  usersQuery: any = {};
  requestList: IID_Request_Modal[] = [];
  returnType: any;
  paginationCount = 1;
  totalCount = 0;

  constructor(
    private idsService: IdsService,
    private authservice: AuthService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.usersQuery = {
      pageNumber: 1,
      userId: this._sessionUser,
      sessionUser: this._sessionUser
    };
    this.fetchRejectedRequests(this.usersQuery);
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
      return;
    }
    this.idsService.idRequestDetails(requestId).subscribe({
      next: (response) => console.log('ID request details', response),
      error: (error) => console.error(error)
    });
  }

  PaginationNumber(pageNumber: number): void {
    this.usersQuery.pageNumber = pageNumber;
    this.usersQuery.userId = this._sessionUser;
    this.usersQuery.sessionUser = this._sessionUser;
    this.fetchRejectedRequests(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
