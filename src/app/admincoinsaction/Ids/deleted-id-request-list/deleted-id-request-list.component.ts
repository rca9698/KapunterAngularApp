import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { IID_Request_Modal } from 'src/app/Shared/Modals/Ids/id-request-modal';
import { IdsService } from '../ids.service';
import { environment } from 'src/environments/environment';
import { resolveAccountRequestId } from '../../shared/id-request.util';

@Component({
  selector: 'app-deleted-id-request-list',
  templateUrl: './deleted-id-request-list.component.html',
  styleUrls: ['./deleted-id-request-list.component.css', '../../shared/admin-listing.shared.css']
})
export class DeletedIdRequestListComponent implements OnInit {
  private readonly _sessionUser: bigint;
  usersQuery: any = {};
  requestList: IID_Request_Modal[] = [];
  returnType: any;
  paginationCount = 1;
  totalCount = 0;
  sitePath = environment.imagePath.sitePath;

  constructor(
    private idsService: IdsService,
    private authservice: AuthService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.usersQuery = {
      pageNumber: 1,
      userId: 0,
      sessionUser: this._sessionUser,
      isDeleted: 1
    };
    this.fetchDeletedRequests(this.usersQuery);
  }

  getRequestId(item: IID_Request_Modal): string {
    return resolveAccountRequestId(item as unknown as Record<string, unknown>);
  }

  fetchDeletedRequests(paginationQuery: any): void {
    this.idsService.deletedIdRequests(paginationQuery).subscribe({
      next: (response) => {
        this.returnType = response;
        this.requestList = this.returnType['returnList'] ?? [];
        this.paginationCount = this.returnType['paginationCount'] ?? 1;
        this.totalCount = this.returnType['totalCount'] ?? 0;
      },
      error: (error) => console.error(error)
    });
  }

  PaginationNumber(pageNumber: number): void {
    this.usersQuery.pageNumber = pageNumber;
    this.fetchDeletedRequests(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
