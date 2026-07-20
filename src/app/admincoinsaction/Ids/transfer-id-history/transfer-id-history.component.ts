import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { IdsService } from '../ids.service';
import { environment } from 'src/environments/environment';
import { ITransferIDRequestDetail } from 'src/app/Shared/Modals/Ids/transfer-id-request';
import { buildSiteLogoUrl } from 'src/app/Shared/Utils/site-image.util';

@Component({
  selector: 'app-transfer-id-history',
  templateUrl: './transfer-id-history.component.html',
  styleUrls: ['../shared/transfer-id-listing.shared.css']
})
export class TransferIdHistoryComponent implements OnInit {
  private readonly _sessionUser: any;
  usersQuery: any = {};
  historyList: ITransferIDRequestDetail[] = [];
  sitePath = environment.imagePath.sitePath;

  constructor(
    private idsService: IdsService,
    private authservice: AuthService,
    private toasterService: ToastrService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.usersQuery = {
      pageNumber: 1,
      userId: 0,
      sessionUser: this._sessionUser
    };
    this.fetchTransferHistory();
  }

  fetchTransferHistory(): void {
    this.idsService.listTransferIDHistory(this.usersQuery).subscribe({
      next: (response: any) => {
        this.historyList = response?.['returnList'] ?? [];
      },
      error: () => this.toasterService.warning('Unable to load transfer history')
    });
  }

  sourceAccountId(item: ITransferIDRequestDetail): number {
    return Number((item as any).sourceAccountId ?? item.sourceAccountId ?? (item as any).accountId ?? 0);
  }

  targetAccountId(item: ITransferIDRequestDetail): number {
    return Number((item as any).targetAccountId ?? item.targetAccountId ?? 0);
  }

  sourceUserName(item: ITransferIDRequestDetail): string {
    return (item as any).sourceUserName ?? (item as any).userName ?? '—';
  }

  targetUserName(item: ITransferIDRequestDetail): string {
    return (item as any).targetUserName ?? '—';
  }

  transferAmount(item: ITransferIDRequestDetail): string {
    const amount = Number((item as any).transferAmount ?? item.transferAmount ?? 0);
    return amount > 0 ? amount.toFixed(2) : '—';
  }

  approvedDate(item: ITransferIDRequestDetail): string {
    return (item as any).approvedDate ?? item.approvedDate ?? '—';
  }

  statusLabel(item: ITransferIDRequestDetail): string {
    return item.statusLabel
      || (this.isApproved(item) ? 'Approved' : this.isRejected(item) ? 'Rejected' : 'Processed');
  }

  isApproved(item: ITransferIDRequestDetail): boolean {
    return item.isApproved === true || Number((item as any).isApproved) === 1;
  }

  isRejected(item: ITransferIDRequestDetail): boolean {
    return item.isRejected === true || Number((item as any).isRejected) === 1;
  }

  siteLogoUrl(documentDetailId?: string, fileExtenstion?: string): string | null {
    return buildSiteLogoUrl(this.sitePath, documentDetailId, fileExtenstion);
  }

  trackByReqId(_i: number, item: ITransferIDRequestDetail): number {
    return (item as any).reqId ?? _i;
  }
}
