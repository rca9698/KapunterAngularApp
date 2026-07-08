import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Iusers } from 'src/app/Shared/Modals/users';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-deleted-user-list',
  templateUrl: './deleted-user-list.component.html',
  styleUrls: ['./deleted-user-list.component.css', '../../shared/admin-listing.shared.css']
})
export class DeletedUserListComponent implements OnInit {
  usersQuery: any;
  usersList: Iusers[] = [];
  returnType: any;
  paginationCount = 1;
  totalCount = 0;
  currentPage = 0;
  private readonly _sessionUser: bigint;

  constructor(
    private userService: UserService,
    private authservice: AuthService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.usersQuery = {
      sessionUser: this._sessionUser,
      pageNumber: 0,
      isDeleted: 1
    };
    this.fetchDeletedUsers(this.usersQuery);
  }

  getDisplayName(user: Iusers): string {
    return user.fullName?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || '—';
  }

  fetchDeletedUsers(paginationQuery: any): void {
    this.userService.deletedUserList(paginationQuery).subscribe({
      next: (response) => {
        this.returnType = response;
        this.usersList = this.returnType['returnList'] ?? [];
        this.paginationCount = this.returnType['paginationCount'] ?? 1;
        this.totalCount = this.returnType['totalCount'] ?? 0;
        this.currentPage = paginationQuery.pageNumber ?? 0;
      },
      error: (error) => console.error(error)
    });
  }

  PaginationNumber(pageNumber: number): void {
    if (pageNumber < 0 || pageNumber >= this.paginationCount) {
      return;
    }
    this.usersQuery.pageNumber = pageNumber;
    this.fetchDeletedUsers(this.usersQuery);
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }

  hasNextPage(): boolean {
    return this.currentPage < this.paginationCount - 1;
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }

  goToNextPage(): void {
    if (this.hasNextPage()) {
      this.PaginationNumber(this.currentPage + 1);
    }
  }

  goToPreviousPage(): void {
    if (this.hasPreviousPage()) {
      this.PaginationNumber(this.currentPage - 1);
    }
  }
}
