import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute } from '@angular/router';
import { PassbookService } from 'src/app/Passbook/passbook.service';
import { Ipassbook_detail_model } from 'src/app/Shared/Modals/passbook_detail_model';

@Component({
  selector: 'app-get-user-site-transaction-history',
  templateUrl: './get-user-site-transaction-history.component.html',
  styleUrls: ['./get-user-site-transaction-history.component.css']
})
export class GetUserSiteTransactionHistoryComponent implements OnInit {

  contextSite?: ISiteDetailModal;
  sitePath = environment.imagePath.sitePath;
  loading = false;
  userId: string | number | null = null;

  private readonly _sessionUser: any;
  passbooks: Ipassbook_detail_model[] = [];

  constructor(
    public bsModalRef: BsModalRef,
    private toasterService: ToastrService,
    public authservice: AuthService,
    private activatedRoute: ActivatedRoute,
    private passbookservice: PassbookService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    if (this.contextSite?.siteId) {
      this.loadTransactions();
      return;
    }

    this.activatedRoute.params.subscribe(params => {
      this.userId = params['userId'] || this._sessionUser;
      this.loadTransactions();
    });
  }

  close(): void {
    this.bsModalRef.hide();
  }

  hasSiteImage(): boolean {
    return !!(this.contextSite?.documentDetailId && this.contextSite?.fileExtenstion);
  }

  getSiteImageUrl(): string {
    const site = this.contextSite;
    if (!site?.documentDetailId || !site?.fileExtenstion) {
      return '';
    }
    return `${this.sitePath}${site.documentDetailId}${site.fileExtenstion}`;
  }

  getTxnImageUrl(txn: Ipassbook_detail_model): string {
    if (txn?.documentDetailId && txn?.fileExtenstion) {
      return `${this.sitePath}${txn.documentDetailId}${txn.fileExtenstion}`;
    }
    return this.getSiteImageUrl();
  }

  hasTxnImage(txn: Ipassbook_detail_model): boolean {
    return !!this.getTxnImageUrl(txn);
  }

  getSiteDisplayName(): string {
    return this.contextSite?.siteName ?? '';
  }

  getTxnSiteLabel(txn: Ipassbook_detail_model): string {
    return txn.siteName || this.getSiteDisplayName();
  }

  loadTransactions(): void {
    if (!this.contextSite?.siteId) {
      this.passbooks = [];
      return;
    }

    this.loading = true;

    const obj = {
      userId: this._sessionUser,
      siteId: this.contextSite.siteId,
      sessionUser: this._sessionUser
    };

    this.passbookservice.passbookHistorylist(obj).subscribe({
      next: (resp: any) => {
        if (resp['returnStatus'] == 1) {
          this.passbooks = resp['returnList'] ?? [];
        } else {
          this.toasterService.warning(resp.returnMessage);
          this.passbooks = [];
        }
        this.loading = false;
      },
      error: () => {
        this.toasterService.error('Error loading transactions');
        this.passbooks = [];
        this.loading = false;
      }
    });
  }
}
