import { Component, OnInit } from '@angular/core';
import { CoinsService } from '../coins.service';
import { Icoins_to_site_request_listing_modal } from 'src/app/Shared/Modals/Coins/coins_to_site_request_listing_modal';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { resolveAccountId } from '../coins-request.util';

@Component({
  selector: 'app-deposit-to-site-history',
  templateUrl: './deposit-to-site-history.component.html',
  styleUrls: ['./deposit-to-site-history.component.css', '../coins-listing.shared.css']
})
export class DepositToSiteHistoryComponent implements OnInit {
  requestList: Icoins_to_site_request_listing_modal[] = [];
  sitePath = environment.imagePath.sitePath;
  loading = false;
  private readonly _sessionUser: bigint;

  constructor(
    private coinsservice: CoinsService,
    private authservice: AuthService,
    private toasterService: ToastrService
  ) {
    this._sessionUser = BigInt(this.authservice.user?.userId ?? 0);
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    if (!this._sessionUser || this._sessionUser === 0n) {
      this.toasterService.warning('Session expired. Please sign in again.');
      return;
    }

    this.loading = true;
    this.coinsservice.deposit_to_site_history(1, this._sessionUser).subscribe({
      next: (resp: any) => {
        this.loading = false;
        this.requestList = resp?.returnList ?? [];
        // Empty history is valid; only warn on real failures.
        if (resp?.returnStatus != null && Number(resp.returnStatus) !== 1 && this.requestList.length === 0) {
          this.toasterService.warning(
            resp.returnMessage || 'Deposit history unavailable. Deploy USP_ListCoinsToAccountRequestHistory and restart the API.'
          );
        }
      },
      error: (err) => {
        this.loading = false;
        this.requestList = [];
        const msg =
          err?.error?.returnMessage ||
          err?.message ||
          'Unable to load deposit history. Confirm the API is running and USP_ListCoinsToAccountRequestHistory is deployed.';
        this.toasterService.warning(msg);
      }
    });
  }

  getAccountId(request: Icoins_to_site_request_listing_modal): string {
    try {
      return String(resolveAccountId(request as unknown as Record<string, unknown>));
    } catch {
      return '0';
    }
  }

  getAccountLabel(request: Icoins_to_site_request_listing_modal): string {
    return request.accountUserName || request.userName || this.getAccountId(request);
  }

  statusLabel(request: Icoins_to_site_request_listing_modal): string {
    return (request as any).statusLabel || ((request as any).requestStatus === 1 ? 'Approved' : 'Rejected');
  }

  isApproved(request: Icoins_to_site_request_listing_modal): boolean {
    return Number((request as any).requestStatus) === 1
      || String(this.statusLabel(request)).toLowerCase() === 'approved';
  }
}
