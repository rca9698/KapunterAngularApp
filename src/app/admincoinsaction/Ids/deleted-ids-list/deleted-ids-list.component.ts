import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { IIDDetailsModal } from 'src/app/Shared/Modals/Ids/id_detail-modal';
import { IdsService } from '../ids.service';
import { environment } from 'src/environments/environment';
import { resolveAccountId } from '../../shared/id-request.util';

@Component({
  selector: 'app-deleted-ids-list',
  templateUrl: './deleted-ids-list.component.html',
  styleUrls: ['./deleted-ids-list.component.css', '../../shared/admin-listing.shared.css']
})
export class DeletedIdsListComponent implements OnInit {
  private readonly _sessionUser: bigint;
  usersQuery: any = {};
  idList: IIDDetailsModal[] = [];
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
    this.fetchDeletedIds(this.usersQuery);
  }

  getAccountId(id: IIDDetailsModal): string {
    return resolveAccountId(id as unknown as Record<string, unknown>);
  }

  fetchDeletedIds(paginationQuery: any): void {
    this.idsService.deletedIds(paginationQuery).subscribe({
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
    this.fetchDeletedIds(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
