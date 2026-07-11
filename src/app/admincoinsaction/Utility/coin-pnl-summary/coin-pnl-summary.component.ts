import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/api.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';

@Component({
  selector: 'app-coin-pnl-summary',
  templateUrl: './coin-pnl-summary.component.html',
  styleUrls: ['./coin-pnl-summary.component.css', '../../shared/admin-listing.shared.css']
})
export class CoinPnlSummaryComponent implements OnInit {
  loading = false;
  search = '';
  fromDate = '';
  toDate = '';
  rows: Array<{
    userId: number;
    userNumber: string;
    fullName: string;
    totalDeposit: number;
    totalWithdraw: number;
    profitLoss: number;
  }> = [];

  totals = { deposit: 0, withdraw: 0, pnl: 0 };

  constructor(
    private api: apiService,
    private auth: AuthService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    this.toDate = to.toISOString().slice(0, 10);
    this.fromDate = from.toISOString().slice(0, 10);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.getAdminCoinPnL(this.fromDate || undefined, this.toDate || undefined, this.search?.trim() || undefined)
      .subscribe({
        next: (resp: any) => {
          this.loading = false;
          const list = resp?.returnList ?? resp?.ReturnList ?? [];
          this.rows = (Array.isArray(list) ? list : []).map((row: any) => ({
            userId: Number(row.userId ?? row.UserId ?? 0),
            userNumber: String(row.userNumber ?? row.UserNumber ?? ''),
            fullName: String(row.fullName ?? row.FullName ?? ''),
            totalDeposit: Number(row.totalDeposit ?? row.TotalDeposit ?? 0),
            totalWithdraw: Number(row.totalWithdraw ?? row.TotalWithdraw ?? 0),
            profitLoss: Number(row.profitLoss ?? row.ProfitLoss ?? 0)
          }));
          this.totals = {
            deposit: this.rows.reduce((s, r) => s + r.totalDeposit, 0),
            withdraw: this.rows.reduce((s, r) => s + r.totalWithdraw, 0),
            pnl: this.rows.reduce((s, r) => s + r.profitLoss, 0)
          };
        },
        error: () => {
          this.loading = false;
          this.rows = [];
          this.toaster.warning('Unable to load deposit / withdraw summary.');
        }
      });
  }
}
