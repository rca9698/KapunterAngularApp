import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Iusers } from 'src/app/Shared/Modals/users';
import { CoinsService } from '../../coins/coins.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css', '../../shared/admin-listing.shared.css']
})
export class UserListComponent implements OnInit {
  usersQuery: any;
  usersList: Iusers[] = [];
  returnType: any;
  paginationCount = 1;
  totalCount = 0;
  currentPage = 0;
  private readonly _sessionUser: bigint;

  constructor(
    private userService: UserService,
    private coinsService: CoinsService,
    private deletemodule: DeleteService,
    private authservice: AuthService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.userlist();
  }

  getDisplayName(user: Iusers): string {
    return user.fullName?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || '—';
  }

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }

  isActivePage(pageNumber: number): boolean {
    return this.currentPage === pageNumber;
  }

  hasNextPage(): boolean {
    return this.currentPage < this.paginationCount - 1;
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }

  fetchUserList(paginationQuery: any): void {
    this.userService.userlist(paginationQuery).subscribe({
      next: (response) => {
        this.returnType = response;
        this.usersList = this.returnType['returnList'] ?? [];
        this.paginationCount = this.returnType['paginationCount'] ?? 1;
        this.totalCount = this.returnType['totalCount'] ?? this.usersList.length;
        this.currentPage = paginationQuery.pageNumber ?? 0;
      },
      error: (error) => console.error(error)
    });
  }

  userlist(): void {
    this.usersQuery = {
      sessionUser: this._sessionUser,
      pageNumber: 0,
      isDeleted: 0
    };
    this.fetchUserList(this.usersQuery);
  }

  depositeCoinsByUserId(user: Iusers): void {
    this.coinsService.OpenDepositeCoinsByUserIdPopup(user.userNumber);
  }

  withdrawCoinsByUserId(user: Iusers): void {
    this.coinsService.OpenWithdrawCoinsUserIdPopup(user.userNumber);
  }

  deleteUser(user: Iusers): void {
    this.deletemodule.OpenDeletePopup('user', 'User', user);
  }

  PaginationNumber(pageNumber: number): void {
    if (pageNumber < 0 || pageNumber >= this.paginationCount) {
      return;
    }
    this.usersQuery.pageNumber = pageNumber;
    this.fetchUserList(this.usersQuery);
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
