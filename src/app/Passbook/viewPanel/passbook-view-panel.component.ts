import { Component, OnInit } from '@angular/core';
import { Ipassbook_detail_model } from 'src/app/Shared/Modals/passbook_detail_model';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { PassbookService } from '../passbook.service';
import { PassbookUnreadService } from 'src/app/Shared/passbook-unread/passbook-unread.service';
import {
  formatPassbookAmount,
  isNonMonetaryPassbookActivity,
  passbookActivityKind
} from 'src/app/Shared/Utils/passbook-display.util';

@Component({
  selector: 'app-passbook-view-panel',
  templateUrl: './passbook-view-panel.component.html',
  styleUrls: ['./passbook-view-panel.component.css']
})
export class PassbookViewPanelComponent implements OnInit {

  passbooks: Ipassbook_detail_model[] = [];
  loading = false;
  expandedId: string | null = null;
  detailById: Record<string, Ipassbook_detail_model> = {};
  loadingDetailId: string | null = null;

  private readonly _sessionUser: any;
  private readonly proofPath: string | undefined;
  private readonly sitePath: string | undefined;

  trackByPassbookId = (_i: number, item: Ipassbook_detail_model): string => {
    return item.passbookHistoryId || String(_i);
  };

  constructor(
    private toasterService: ToastrService,
    private authservice: AuthService,
    private passbookservice: PassbookService,
    private passbookUnread: PassbookUnreadService
  ) {
    this.proofPath = environment.imagePath.proofPath;
    this.sitePath = environment.imagePath.sitePath;
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.passbookHistorylist(1);
  }

  hasValidImagePath(item: Ipassbook_detail_model | undefined): boolean {
    return !!item?.documentDetailId && !!item?.fileExtenstion;
  }

  hasValidProofPath(item: Ipassbook_detail_model | undefined): boolean {
    return !!item?.proofDocumentDetailID && !!(item?.proofFileExtenstion || item?.fileExtenstion);
  }

  getImagePath(item: Ipassbook_detail_model | undefined): string {
    if (!this.hasValidImagePath(item) || !item) {
      return '';
    }
    return `${this.sitePath || ''}${item.documentDetailId}${item.fileExtenstion}`;
  }

  getProofPath(item: Ipassbook_detail_model | undefined): string {
    if (!item?.proofDocumentDetailID) {
      return '';
    }
    const ext = item.proofFileExtenstion || item.fileExtenstion || '';
    return `${this.proofPath || ''}${item.proofDocumentDetailID}${ext}`;
  }

  showsAmount(item: Ipassbook_detail_model | undefined): boolean {
    return formatPassbookAmount(item) != null;
  }

  getAmountLabel(item: Ipassbook_detail_model | undefined): string {
    return formatPassbookAmount(item) ?? '';
  }

  isCreateActivity(item: Ipassbook_detail_model | undefined): boolean {
    return isNonMonetaryPassbookActivity(item);
  }

  activityKind(item: Ipassbook_detail_model | undefined): string {
    return passbookActivityKind(item);
  }

  isExpanded(item: Ipassbook_detail_model): boolean {
    return this.expandedId === item.passbookHistoryId;
  }

  getDetail(item: Ipassbook_detail_model): Ipassbook_detail_model {
    return this.detailById[item.passbookHistoryId] || item;
  }

  isDetailLoading(item: Ipassbook_detail_model): boolean {
    return this.loadingDetailId === item.passbookHistoryId;
  }

  toggleExpand(item: Ipassbook_detail_model, event?: Event): void {
    event?.stopPropagation();
    const id = item.passbookHistoryId;
    if (this.expandedId === id) {
      this.expandedId = null;
      return;
    }
    this.expandedId = id;
    this.detailById[id] = { ...item };
    this.loadDetail(id);
  }

  passbookHistorylist(siteId: number): void {
    this.loading = true;
    this.expandedId = null;
    this.detailById = {};
    const obj = {
      userId: this._sessionUser,
      siteId,
      sessionUser: this._sessionUser
    };

    this.passbookservice.passbookHistorylist(obj).subscribe({
      next: (resp) => {
        const returnType: any = resp;
        if (returnType['returnStatus'] == 1) {
          this.passbooks = returnType['returnList'] ?? [];
          this.passbookUnread.markAllAsRead(this.passbooks);
        } else {
          this.passbooks = [];
          this.passbookUnread.markAllAsRead([]);
          this.toasterService.warning(returnType.returnMessage);
        }
        this.loading = false;
      },
      error: () => {
        this.passbooks = [];
        this.loading = false;
        this.toasterService.warning('Unable to load transaction history.');
      }
    });
  }

  private loadDetail(passbookid: string): void {
    this.loadingDetailId = passbookid;
    const obj = {
      PassbookId: passbookid,
      sessionUser: this._sessionUser
    };

    this.passbookservice.passbookHistorybyid(obj).subscribe({
      next: (resp) => {
        const returnType: any = resp;
        if (returnType['returnStatus'] == 1 && returnType['returnVal']) {
          this.detailById[passbookid] = returnType['returnVal'];
        }
        this.loadingDetailId = null;
      },
      error: () => {
        this.loadingDetailId = null;
        this.toasterService.warning('Unable to load transaction details.');
      }
    });
  }
}
