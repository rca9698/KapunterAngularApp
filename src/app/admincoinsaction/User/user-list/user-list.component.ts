import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserService } from '../user.service';
import { Iusers } from 'src/app/Shared/Modals/users';
import { CoinsService } from '../../coins/coins.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { AuthService } from 'src/app/auth.service';
import { apiService } from 'src/app/api.service';
import { ToastrService } from 'src/app/toastr/toastr.service';

export interface UserCoinPnL {
  totalDeposit: number;
  totalWithdraw: number;
  profitLoss: number;
}

export interface UserCoinPnLDetail extends UserCoinPnL {
  deposit7: number;
  deposit30: number;
  withdraw7: number;
  withdraw30: number;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css', '../../shared/admin-listing.shared.css']
})
export class UserListComponent implements OnInit {
  @ViewChild('pnlModal') pnlModalTpl?: TemplateRef<unknown>;

  usersQuery: any;
  usersList: Iusers[] = [];
  returnType: any;
  paginationCount = 1;
  totalCount = 0;
  currentPage = 0;
  private readonly _sessionUser: bigint;

  /** All-time P/L by userId (deposit − withdraw, passbook approvals only). */
  pnlByUserId: Record<string, UserCoinPnL> = {};
  pnlLoading = false;

  selectedUser: Iusers | null = null;
  detail: UserCoinPnLDetail | null = null;
  detailLoading = false;
  private modalRef?: BsModalRef;

  constructor(
    private userService: UserService,
    private coinsService: CoinsService,
    private deletemodule: DeleteService,
    private authservice: AuthService,
    private router: Router,
    private api: apiService,
    private modalService: BsModalService,
    private toaster: ToastrService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.userlist();
    this.loadAllTimePnL();
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

  /** All-time deposit/withdraw P/L for listing (passbook approvals only). */
  loadAllTimePnL(): void {
    this.pnlLoading = true;
    this.api.getAdminCoinPnL().subscribe({
      next: (resp: any) => {
        this.pnlLoading = false;
        const list = resp?.returnList ?? resp?.ReturnList ?? [];
        const map: Record<string, UserCoinPnL> = {};
        (Array.isArray(list) ? list : []).forEach((row: any) => {
          const id = String(row.userId ?? row.UserId ?? '');
          if (!id) return;
          map[id] = {
            totalDeposit: Number(row.totalDeposit ?? row.TotalDeposit ?? 0),
            totalWithdraw: Number(row.totalWithdraw ?? row.TotalWithdraw ?? 0),
            profitLoss: Number(row.profitLoss ?? row.ProfitLoss ?? 0)
          };
        });
        this.pnlByUserId = map;
      },
      error: () => {
        this.pnlLoading = false;
        this.pnlByUserId = {};
      }
    });
  }

  getPnL(user: Iusers): UserCoinPnL {
    return this.pnlByUserId[String(user.userId)] ?? {
      totalDeposit: 0,
      totalWithdraw: 0,
      profitLoss: 0
    };
  }

  pnlTone(value: number): 'profit' | 'loss' | 'even' {
    if (value > 0) return 'profit';
    if (value < 0) return 'loss';
    return 'even';
  }

  pnlLabel(value: number): string {
    if (value > 0) return 'Profit';
    if (value < 0) return 'Loss';
    return 'Even';
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(value ?? 0));
  }

  openPnLDetail(user: Iusers, event?: Event): void {
    event?.stopPropagation();
    this.selectedUser = user;
    this.detail = null;
    this.detailLoading = true;
    if (this.pnlModalTpl) {
      this.modalRef = this.modalService.show(this.pnlModalTpl, {
        class: 'modal-dialog-centered user-pnl-modal',
        backdrop: true
      });
    }

    this.api.getUserDepositStats(user.userId).subscribe({
      next: (resp: any) => {
        this.detailLoading = false;
        const val = resp?.returnVal ?? resp?.ReturnVal ?? {};
        const deposit = Number(val.totalDeposit ?? val.TotalDeposit ?? 0);
        const withdraw = Number(val.totalWithdraw ?? val.TotalWithdraw ?? 0);
        const profitLoss = Number(
          val.profitLoss ?? val.ProfitLoss ?? deposit - withdraw
        );
        this.detail = {
          deposit7: Number(val.depositLast7Days ?? val.DepositLast7Days ?? 0),
          deposit30: Number(val.depositLast30Days ?? val.DepositLast30Days ?? 0),
          withdraw7: Number(val.withdrawLast7Days ?? val.WithdrawLast7Days ?? 0),
          withdraw30: Number(val.withdrawLast30Days ?? val.WithdrawLast30Days ?? 0),
          totalDeposit: deposit,
          totalWithdraw: withdraw,
          profitLoss
        };
      },
      error: () => {
        this.detailLoading = false;
        this.toaster.warning('Unable to load deposit / withdraw summary.');
      }
    });
  }

  windowPnL(deposit: number, withdraw: number): number {
    return deposit - withdraw;
  }

  closePnLModal(): void {
    this.modalRef?.hide();
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

  viewUserSiteAccounts(user: Iusers): void {
    this.router.navigate(['/adminaction/user_list', user.userId, 'site-accounts'], {
      queryParams: { userNumber: user.userNumber }
    });
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
