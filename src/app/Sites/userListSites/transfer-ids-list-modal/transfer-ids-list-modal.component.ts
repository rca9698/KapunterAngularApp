import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IdsService } from 'src/app/admincoinsaction/Ids/ids.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { IIDDetailsModal } from 'src/app/Shared/Modals/Ids/id_detail-modal';
import { TransferAccountOption } from 'src/app/Shared/Modals/Ids/transfer-id-request';
import { serializeForApi } from 'src/app/Shared/Utils/api-serialize.util';
import {
  KapunterApiResponse,
  readApiList,
  readApiMessage,
  readApiStatus,
} from 'src/app/Shared/Utils/api-response.util';
import { buildSiteLogoUrl } from 'src/app/Shared/Utils/site-image.util';
import {
  mapIdToTransferAccount,
  resolveAccountIdValue,
} from 'src/app/Shared/Utils/transfer-account.util';

@Component({
  selector: 'app-transfer-ids-list-modal',
  templateUrl: './transfer-ids-list-modal.component.html',
  styleUrls: ['./transfer-ids-list-modal.component.css'],
})
export class TransferIdsListModalComponent implements OnInit {
  contextSite?: ISiteDetailModal;

  sitePath = environment.imagePath.sitePath;
  sourceAccount: TransferAccountOption | null = null;
  destinationAccounts: TransferAccountOption[] = [];
  selectedDestination: TransferAccountOption | null = null;
  loading = true;
  submitting = false;

  constructor(
    public bsModalRef: BsModalRef,
    private idsService: IdsService,
    private authservice: AuthService,
    private toasterService: ToastrService
  ) {}

  ngOnInit(): void {
    const uid = this.authservice.user.userId;
    const sourceAccountId = resolveAccountIdValue(this.contextSite as unknown as Record<string, unknown>);

    this.idsService.listIds({ userId: uid, sessionUser: uid }).subscribe({
      next: (response) => {
        this.loading = false;
        const apiResponse = response as KapunterApiResponse<IIDDetailsModal>;

        if (readApiStatus(apiResponse) != 1) {
          this.toasterService.warning(readApiMessage(apiResponse) ?? 'Unable to load your accounts');
          return;
        }

        const accounts = readApiList(apiResponse)
          .map((row) => mapIdToTransferAccount(row))
          .filter((row): row is TransferAccountOption => !!row);

        this.sourceAccount =
          accounts.find((account) => account.accountId === sourceAccountId) ?? null;

        if (!this.sourceAccount) {
          return;
        }

        this.destinationAccounts = accounts.filter(
          (account) => account.accountId !== this.sourceAccount!.accountId
        );
      },
      error: () => {
        this.loading = false;
        this.toasterService.warning('Unable to load your accounts');
      },
    });
  }

  get hasSourceAccount(): boolean {
    return !!this.sourceAccount;
  }

  get hasDestinations(): boolean {
    return this.destinationAccounts.length > 0;
  }

  selectDestination(account: TransferAccountOption): void {
    this.selectedDestination = account;
  }

  isSelectedDestination(account: TransferAccountOption): boolean {
    return this.selectedDestination?.key === account.key;
  }

  submitTransferRequest(): void {
    if (!this.sourceAccount || !this.selectedDestination || this.submitting) {
      return;
    }

    this.submitting = true;
    const payload = serializeForApi({
      accountId: this.sourceAccount.accountId,
      targetAccountId: this.selectedDestination.accountId,
      targetSiteId: this.selectedDestination.siteId,
      sessionUser: this.authservice.user.userId,
    });

    this.idsService.addTransferIDRequest(payload).subscribe({
      next: (response: any) => {
        this.submitting = false;
        if (response?.returnStatus === 1) {
          this.toasterService.success(response?.returnMessage ?? 'Transfer request submitted');
          this.bsModalRef.hide();
        } else {
          this.toasterService.warning(response?.returnMessage ?? 'Unable to submit transfer request');
        }
      },
      error: () => {
        this.submitting = false;
        this.toasterService.warning('Unable to submit transfer request');
      },
    });
  }

  trackByAccountKey(_i: number, account: TransferAccountOption): string {
    return account.key;
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
}
