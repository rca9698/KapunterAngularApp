import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { IdsService } from '../ids.service';
import { ITransferIDRequestDetail } from 'src/app/Shared/Modals/Ids/transfer-id-request';
import { environment } from 'src/environments/environment';
import { buildSiteLogoUrl } from 'src/app/Shared/Utils/site-image.util';
import { serializeForApi } from 'src/app/Shared/Utils/api-serialize.util';

@Component({
  selector: 'app-approve-transfer-id-modal',
  templateUrl: './approve-transfer-id-modal.component.html',
  styleUrls: ['./approve-transfer-id-modal.component.css']
})
export class ApproveTransferIdModalComponent implements OnInit {
  request!: ITransferIDRequestDetail;
  onApproved?: () => void;

  sitePath = environment.imagePath.sitePath;
  approveForm: FormGroup;
  submitted = false;
  saving = false;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private idsService: IdsService,
    private authService: AuthService,
    private toasterService: ToastrService
  ) {
    this.approveForm = this.formBuilder.group({
      transferAmount: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    const requested = Number((this.request as any)?.transferAmount ?? this.request?.transferAmount ?? 0);
    if (requested > 0) {
      this.approveForm.patchValue({ transferAmount: requested });
    }
  }

  get sourceAccountId(): number {
    return Number((this.request as any)?.sourceAccountId ?? this.request?.sourceAccountId ?? (this.request as any)?.accountId ?? 0);
  }

  get targetAccountId(): number {
    return Number((this.request as any)?.targetAccountId ?? this.request?.targetAccountId ?? 0);
  }

  get sourceUserName(): string {
    return (this.request as any)?.sourceUserName ?? (this.request as any)?.userName ?? '—';
  }

  get targetUserName(): string {
    return (this.request as any)?.targetUserName ?? '—';
  }

  siteLogoUrl(documentDetailId?: string, fileExtenstion?: string): string | null {
    return buildSiteLogoUrl(this.sitePath, documentDetailId, fileExtenstion);
  }

  submitApproval(): void {
    this.submitted = true;
    if (this.approveForm.invalid || this.saving) {
      return;
    }

    this.saving = true;
    const reqId = Number((this.request as any)?.reqId ?? 0);
    const payload = serializeForApi({
      reqId,
      transferAmount: Number(this.approveForm.value.transferAmount),
      sessionUser: this.authService.user.userId,
    });

    this.idsService.confirmTransferIDRequest(payload).subscribe({
      next: (response: any) => {
        this.saving = false;
        if (response?.returnStatus === 1) {
          this.toasterService.success(response?.returnMessage ?? 'Transfer approved');
          this.onApproved?.();
          this.bsModalRef.hide();
        } else {
          this.toasterService.warning(response?.returnMessage ?? 'Unable to approve transfer');
        }
      },
      error: () => {
        this.saving = false;
        this.toasterService.warning('Unable to approve transfer');
      },
    });
  }
}
