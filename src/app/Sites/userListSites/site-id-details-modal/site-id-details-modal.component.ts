import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { forkJoin } from 'rxjs';
import { IdsService } from 'src/app/admincoinsaction/Ids/ids.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { IIDDetailsModal } from 'src/app/Shared/Modals/Ids/id_detail-modal';
import { resolveAccountId } from 'src/app/admincoinsaction/shared/id-request.util';
import { buildSiteLogoUrl } from 'src/app/Shared/Utils/site-image.util';

@Component({
  selector: 'app-site-id-details-modal',
  templateUrl: './site-id-details-modal.component.html',
  styleUrls: ['./site-id-details-modal.component.css'],
})
export class SiteIdDetailsModalComponent implements OnInit {
  contextSite!: ISiteDetailModal;
  accountId?: bigint | string | number;
  /** When true, show only the ID for the selected account (per-account pages). */
  filterByAccount = false;

  sitePath = environment.imagePath?.sitePath || '';
  ids: IIDDetailsModal[] = [];
  loading = true;
  returnType: any;
  IdsByUserSiteQuery: any;
  /** Per-row reveal for password */
  passwordRevealed: Record<string, boolean> = {};
  closingAccountId: string | null = null;
  closeReason = '';
  closeSubmitting = false;

  constructor(
    public bsModalRef: BsModalRef,
    private idsService: IdsService,
    private authservice: AuthService,
    private toasterService: ToastrService
  ) {}

  ngOnInit(): void {
    if (!this.contextSite) {
      this.loading = false;
      return;
    }
    const uid = this.authservice.user.userId;
    this.IdsByUserSiteQuery = {
      pageNumber: 1,
      userId: this.contextSite.userId,
      sessionUser: uid
    };

    const siteId = Number(this.contextSite.siteId);
    this.idsService.listIdsByUserSite({ userId: uid, siteId, sessionUser: uid }).subscribe({
      next: (response) => {
        this.returnType = response;
        const status = Number(this.returnType?.['returnStatus'] ?? this.returnType?.['ReturnStatus'] ?? 0);
        const all: IIDDetailsModal[] = this.returnType?.['returnList']
          ?? this.returnType?.['ReturnList']
          ?? [];
        const hasRows = Array.isArray(all) && all.length > 0;

        if (status === 1 || hasRows) {
          this.ids = all.filter((x) => {
            const rowSite = Number((x as any)?.siteId ?? (x as any)?.SiteId ?? 0);
            return !siteId || !rowSite || rowSite === siteId;
          });
          if (this.filterByAccount) {
            const targetAccountId = resolveAccountId({
              accountId: this.accountId ?? this.contextSite.accountId,
              AccountId: (this.contextSite as any)?.AccountId,
            });
            if (targetAccountId) {
              this.ids = this.ids.filter(
                (x) => resolveAccountId(x as unknown as Record<string, unknown>) === targetAccountId
              );
            }
          }
          this.fetchMissingPasswords();
        } else {
          this.toasterService.warning(this.returnType?.returnMessage ?? this.returnType?.ReturnMessage ?? 'Unable to load IDs');
          this.ids = [];
          this.loading = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.toasterService.warning('Unable to load IDs');
        this.ids = [];
        this.loading = false;
      },
    });
  }

  trackById = (_i: number, row: IIDDetailsModal): string => {
    return this.rowKey(row);
  };

  rowKey(row: IIDDetailsModal): string {
    return String(row.accountId ?? row.reqId ?? '');
  }

  isPasswordRevealed(row: IIDDetailsModal): boolean {
    return !!this.passwordRevealed[this.rowKey(row)];
  }

  togglePasswordReveal(row: IIDDetailsModal): void {
    const k = this.rowKey(row);
    this.passwordRevealed[k] = !this.passwordRevealed[k];
  }

  private needsDetailFetch(row: IIDDetailsModal): boolean {
    const p = row.password;
    const empty = !p || String(p).trim() === '';
    return empty && !!row.reqId;
  }

  private applyDetail(row: IIDDetailsModal, response: any): void {
    if (response?.returnStatus != 1 || !response?.returnVal) {
      return;
    }
    const v = response.returnVal;
    row.userName = v.userName ?? v.UserName ?? row.userName;
    row.password = v.password ?? v.Password ?? row.password;
  }

  private fetchMissingPasswords(): void {
    const pending = this.ids.filter((r) => this.needsDetailFetch(r));
    if (!pending.length) {
      this.loading = false;
      return;
    }
    forkJoin(pending.map((r) => this.idsService.idRequestDetails(r.reqId))).subscribe({
      next: (responses) => {
        pending.forEach((r, i) => this.applyDetail(r, responses[i]));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  siteLogoUrl(documentDetailId?: string, fileExtenstion?: string): string | null {
    return buildSiteLogoUrl(this.sitePath, documentDetailId, fileExtenstion);
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.style.visibility = 'hidden';
    }
  }

  startClose(row: IIDDetailsModal): void {
    const accountId = resolveAccountId(row as unknown as Record<string, unknown>);
    this.closingAccountId = accountId;
    this.closeReason = '';
  }

  cancelClose(): void {
    this.closingAccountId = null;
    this.closeReason = '';
  }

  submitClose(row: IIDDetailsModal): void {
    const reason = (this.closeReason || '').trim();
    if (reason.length < 5) {
      this.toasterService.warning('Please enter a reason (at least 5 characters).');
      return;
    }
    const accountId = resolveAccountId(row as unknown as Record<string, unknown>);
    this.closeSubmitting = true;
    this.idsService.addCloseId({
      userId: this.authservice.user.userId,
      accountId,
      sessionUser: this.authservice.user.userId,
      reason
    }).subscribe({
      next: (resp: any) => {
        this.closeSubmitting = false;
        if ((resp?.returnStatus ?? resp?.ReturnStatus) === 1) {
          this.toasterService.success(resp?.returnMessage ?? 'Close request submitted.');
          this.cancelClose();
        } else {
          this.toasterService.warning(resp?.returnMessage ?? 'Unable to submit close request.');
        }
      },
      error: () => {
        this.closeSubmitting = false;
        this.toasterService.warning('Unable to submit close request.');
      }
    });
  }

  isClosing(row: IIDDetailsModal): boolean {
    return this.closingAccountId === resolveAccountId(row as unknown as Record<string, unknown>);
  }
}
