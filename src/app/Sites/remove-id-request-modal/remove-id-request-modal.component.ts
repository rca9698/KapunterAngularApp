import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/auth.service';
import { IdsService } from 'src/app/admincoinsaction/Ids/ids.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { PassbookActivityToastService } from 'src/app/Shared/passbook-activity-toast/passbook-activity-toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-remove-id-request-modal',
  templateUrl: './remove-id-request-modal.component.html',
  styleUrls: ['./remove-id-request-modal.component.css']
})
export class RemoveIdRequestModalComponent implements OnInit {
  site: any;
  accountName = '';
  siteName = '';
  sitePath = '';
  documentDetailId = '';
  fileExtenstion = '';
  reason = '';
  submitting = false;
  onSubmitted?: () => void;

  constructor(
    public bsModalRef: BsModalRef,
    private authService: AuthService,
    private idsService: IdsService,
    private toasterService: ToastrService,
    private passbookToast: PassbookActivityToastService
  ) {
    this.sitePath = environment.imagePath?.sitePath || '';
  }

  ngOnInit(): void {
    this.accountName = String(this.site?.userName || this.accountName || 'this ID').trim();
    this.siteName = String(this.site?.siteName || this.siteName || '').trim();
    this.documentDetailId = String(this.site?.documentDetailId || '');
    this.fileExtenstion = String(this.site?.fileExtenstion || '');
  }

  submit(): void {
    const text = (this.reason || '').trim();
    if (text.length < 5) {
      this.toasterService.warning('Please enter a reason (at least 5 characters).');
      return;
    }
    const accountId = this.site?.accountId;
    if (!accountId) {
      this.toasterService.warning('Unable to remove this ID right now.');
      return;
    }

    this.submitting = true;
    this.idsService.addCloseId({
      userId: this.authService.user.userId,
      accountId,
      sessionUser: this.authService.user.userId,
      reason: text
    }).subscribe({
      next: (resp: any) => {
        this.submitting = false;
        if ((resp?.returnStatus ?? resp?.ReturnStatus) === 1) {
          this.passbookToast.show({
            kind: 'close',
            title: 'Remove request submitted',
            subtitle: this.accountName,
            detail: 'Admin will review. After approval it appears in Closed and Passbook.',
            amountLabel: undefined
          });
          this.toasterService.success(resp?.returnMessage ?? 'Remove request submitted for admin approval.');
          this.onSubmitted?.();
          this.bsModalRef.hide();
        } else {
          this.toasterService.warning(resp?.returnMessage ?? 'Unable to submit remove request.');
        }
      },
      error: () => {
        this.submitting = false;
        this.toasterService.warning('Unable to submit remove request.');
      }
    });
  }

  cancel(): void {
    this.bsModalRef.hide();
  }
}
