import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { forkJoin } from 'rxjs';
import { IdsService } from 'src/app/admincoinsaction/Ids/ids.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { IIDDetailsModal } from 'src/app/Shared/Modals/Ids/id_detail-modal';

@Component({
  selector: 'app-site-id-details-modal',
  templateUrl: './site-id-details-modal.component.html',
  styleUrls: ['./site-id-details-modal.component.css'],
})
export class SiteIdDetailsModalComponent implements OnInit {
  contextSite!: ISiteDetailModal;

  sitePath = environment.imagePath.sitePath;
  ids: IIDDetailsModal[] = [];
  loading = true;
  returnType: any;
  IdsByUserSiteQuery: any;
  /** Per-row reveal for password */
  passwordRevealed: Record<string, boolean> = {};

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

    this.idsService.listIdsByUserSite({ userId: uid, siteId: this.contextSite.siteId, sessionUser: uid }).subscribe({
      next: (response) => {
        this.returnType = response;
        if (this.returnType['returnStatus'] == 1) {
          const all: IIDDetailsModal[] = this.returnType['returnList'] ?? [];
          const sid = this.contextSite.siteId;
          console.log('Fetched IDs:', sid, all);
          this.ids = all.filter((x) => Number(x.siteId) === Number(sid));
          this.fetchMissingPasswords();
        } else {
          this.toasterService.warning(this.returnType.returnMessage ?? 'Unable to load IDs');
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
}
