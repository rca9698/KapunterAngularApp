import { Component, OnInit } from '@angular/core';
import { IID_Request_Modal } from 'src/app/Shared/Modals/Ids/id-request-modal';
import { IdsService } from '../ids.service';
import { AuthService } from 'src/app/auth.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { environment } from 'src/environments/environment';
import { resolveAccountRequestId } from '../../shared/id-request.util';

@Component({
  selector: 'app-id-request-list',
  templateUrl: './id-request-list.component.html',
  styleUrls: ['./id-request-list.component.css', '../../shared/admin-listing.shared.css']
})
export class IdRequestListComponent implements OnInit {
  _sessionUser: bigint;
  usersQuery: any = {};
  idRequestList: IID_Request_Modal[] = [];
  returnType: any;
  paginationCount = 1;
  totalCount = 0;
  sitePath = environment.imagePath.sitePath;

  constructor(
    private idsService: IdsService,
    private authservice: AuthService,
    private deleteService: DeleteService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.usersQuery = {
      pageNumber: 1,
      userId: 0,
      sessionUser: this._sessionUser,
      isDeleted: 0
    };
    this.fetchIdRequestList(this.usersQuery);
  }

  getRequestId(item: IID_Request_Modal): string {
    return resolveAccountRequestId(item as unknown as Record<string, unknown>);
  }

  CreateIDPopup(obj: IID_Request_Modal): void {
    this.idsService.AdminAddIDPopup(obj);
  }

  DeleteIDRequest(obj: IID_Request_Modal): void {
    this.deleteService.OpenDeletePopup('idrequest', 'ID Request', obj);
  }

  fetchIdRequestList(paginationQuery: any): void {
    this.idsService.listIdRequests(paginationQuery).subscribe({
      next: (response) => {
        this.returnType = response;
        this.idRequestList = this.returnType['returnList'] ?? [];
        this.paginationCount = this.returnType['paginationCount'] ?? 1;
        this.totalCount = this.returnType['totalCount'] ?? this.idRequestList.length;
      },
      error: (error) => console.error(error)
    });
  }

  PaginationNumber(pageNumber: number): void {
    this.usersQuery.pageNumber = pageNumber;
    this.usersQuery.userId = 0;
    this.usersQuery.sessionUser = this._sessionUser;
    this.fetchIdRequestList(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
