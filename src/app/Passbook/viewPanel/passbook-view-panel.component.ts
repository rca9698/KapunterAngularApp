import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ipassbook_detail_model } from 'src/app/Shared/Modals/passbook_detail_model';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { PassbookService } from '../passbook.service';

@Component({
  selector: 'app-passbook-view-panel',
  templateUrl: './passbook-view-panel.component.html',
  styleUrls: ['./passbook-view-panel.component.css']
})
export class PassbookViewPanelComponent implements OnInit {

  passbooks: Ipassbook_detail_model[] = [];
  passbook: Ipassbook_detail_model | undefined;
  proofPath: string | undefined;
  sitePath: string | undefined;
  returnType: any;
  isListPassbookHistory = true;
  isPassbookHistory = false;
  loading = false;

  private readonly _sessionUser: any;

  trackByPassbookId = (_i: number, item: Ipassbook_detail_model): string => {
    return item.passbookHistoryId || String(_i);
  };

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

  constructor(
    private toasterService: ToastrService,
    private authservice: AuthService,
    private router: Router,
    private passbookservice: PassbookService
  ) {
    this.proofPath = environment.imagePath.proofPath;
    this.sitePath = environment.imagePath.sitePath;
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.passbookHistorylist(1);
  }

  viewpassbookHistorylist(): void {
    this.isPassbookHistory = false;
    this.isListPassbookHistory = true;
    this.passbook = undefined;
  }

  passbookHistorylist(siteId: number): void {
    this.loading = true;
    const obj = {
      userId: this._sessionUser,
      siteId,
      sessionUser: this._sessionUser
    };

    this.passbookservice.passbookHistorylist(obj).subscribe({
      next: (resp) => {
        this.returnType = resp;
        this.isPassbookHistory = false;
        this.isListPassbookHistory = true;
        if (this.returnType['returnStatus'] == 1) {
          this.passbooks = this.returnType['returnList'] ?? [];
        } else {
          this.passbooks = [];
          this.toasterService.warning(this.returnType.returnMessage);
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

  PassbookHistoryById(passbookid: string): void {
    this.isPassbookHistory = true;
    this.isListPassbookHistory = false;
    const obj = {
      PassbookId: passbookid,
      sessionUser: this._sessionUser
    };

    this.passbookservice.passbookHistorybyid(obj).subscribe({
      next: (resp) => {
        this.returnType = resp;
        if (this.returnType['returnStatus'] == 1) {
          this.passbook = this.returnType['returnVal'];
        } else {
          this.toasterService.warning(this.returnType.returnMessage);
        }
      },
      error: () => {
        this.toasterService.warning('Unable to load transaction details.');
        this.viewpassbookHistorylist();
      }
    });
  }
}
