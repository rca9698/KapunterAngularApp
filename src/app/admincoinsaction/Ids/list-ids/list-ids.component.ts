import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { IIDDetailsModal } from 'src/app/Shared/Modals/Ids/id_detail-modal';
import { IdsService } from '../ids.service';

@Component({
  selector: 'app-list-ids',
  templateUrl: './list-ids.component.html',
  styleUrls: ['./list-ids.component.css']
})
export class ListIdsComponent implements OnInit {
  private readonly _sessionUser: bigint;
  usersQuery: any = {};
  idList: IIDDetailsModal[] = [];
  returnType: any;
  paginationCount = 1;
  totalCount = 0;

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
      userId: this._sessionUser,
      sessionUser: this._sessionUser
    };
    this.fetchIdList(this.usersQuery);
  }

  DeleteID(obj: IIDDetailsModal): void {
    this.deleteService.OpenDeletePopup('id', 'ID', obj);
  }

  fetchIdList(paginationQuery: any): void {
    this.idsService.listIds(paginationQuery).subscribe({
      next: (response) => {
        this.returnType = response;
        this.idList = this.returnType['returnList'] ?? [];
        this.paginationCount = this.returnType['paginationCount'] ?? 1;
        this.totalCount = this.returnType['totalCount'] ?? 0;
      },
      error: (error) => console.error(error)
    });
  }

  PaginationNumber(pageNumber: number): void {
    this.usersQuery.pageNumber = pageNumber;
    this.usersQuery.userId = this._sessionUser;
    this.usersQuery.sessionUser = this._sessionUser;
    this.fetchIdList(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
