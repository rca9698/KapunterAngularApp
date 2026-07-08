import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BankAccountService } from '../../bank-account.service';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { AuthService } from 'src/app/auth.service';
import { CommonService } from 'src/app/common.service';
import { ToastrService } from 'src/app/toastr/toastr.service';

@Component({
  selector: 'app-add-admin-site-payment',
  templateUrl: './add-admin-site-payment.component.html',
  styleUrls: ['./add-admin-site-payment.component.css']
})
export class AddAdminSitePaymentComponent implements OnInit {
  site!: ISiteDetailModal;
  loading = true;
  submitted = false;
  saving = false;

  bankDetail: Ibank_details | null = null;
  upiDetail: Ibank_details | null = null;
  qrDetail: Ibank_details | null = null;

  bankForm: FormGroup;
  upiForm: FormGroup;
  qrForm: FormGroup;
  qrFile: File | null = null;
  selectedFileName: string | null = null;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private bankAccountService: BankAccountService,
    private authService: AuthService,
    private commonService: CommonService,
    private toasterService: ToastrService
  ) {
    this.bankForm = this.formBuilder.group({
      BName: ['', Validators.required],
      AHName: ['', Validators.required],
      ANumber: ['', Validators.required],
      IFSCCode: ['', Validators.required]
    });
    this.upiForm = this.formBuilder.group({
      UpiName: ['', Validators.required],
      UpiId: ['', Validators.required]
    });
    this.qrForm = this.formBuilder.group({
      QRName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadExisting();
  }

  get canAddBank(): boolean {
    return true;
  }

  get canAddUpi(): boolean {
    return true;
  }

  get canAddQr(): boolean {
    return true;
  }

  get hasAnythingToAdd(): boolean {
    return true;
  }

  loadExisting(): void {
    if (!this.site?.siteId) {
      this.loading = false;
      return;
    }

    const siteId = this.site.siteId;
    forkJoin({
      bank: this.bankAccountService.list_Admin_Bank_Accounts(siteId).pipe(catchError(() => of(null))),
      upi: this.bankAccountService.list_admin_upi_accounts(siteId).pipe(catchError(() => of(null))),
      qr: this.bankAccountService.list_admin_QR_accounts(siteId).pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ bank, upi, qr }) => {
        this.bankDetail = this.pickFirst(bank);
        this.upiDetail = this.pickFirst(upi);
        this.qrDetail = this.pickFirst(qr);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private pickFirst(response: any): Ibank_details | null {
    if (response?.returnStatus !== 1) return null;
    if (response.returnVal) return response.returnVal;
    const list = response.returnList as Ibank_details[] | undefined;
    return list?.length ? list[0] : null;
  }

  processFile(input: HTMLInputElement): void {
    const f = input.files?.[0];
    this.qrFile = f ?? null;
    this.selectedFileName = f?.name ?? null;
  }

  saveAll(): void {
    this.submitted = true;

    const wantsBank = this.bankForm.dirty || Object.values(this.bankForm.value).some((v) => !!String(v ?? '').trim());
    const wantsUpi = this.upiForm.dirty || Object.values(this.upiForm.value).some((v) => !!String(v ?? '').trim());
    const wantsQr = this.qrForm.dirty || !!this.qrFile;

    const bankValid = !wantsBank || this.bankForm.valid;
    const upiValid = !wantsUpi || this.upiForm.valid;
    const qrFormValid = !wantsQr || (this.qrForm.valid && !!this.qrFile);

    if (!bankValid || !upiValid || !qrFormValid) {
      return;
    }

    if (!wantsBank && !wantsUpi && !wantsQr) {
      this.toasterService.warning('Fill at least one payment section to save.');
      return;
    }

    this.saving = true;
    const sessionUser = this.authService.user.userId;
    const siteId = this.site.siteId;
    const requests: ReturnType<BankAccountService['Add_Admin_Bank_Account']>[] = [];

    if (wantsBank) {
      requests.push(this.bankAccountService.Add_Admin_Bank_Account({
        siteId,
        bankName: this.bankForm.value.BName,
        accountHolderName: this.bankForm.value.AHName,
        accountNumber: this.bankForm.value.ANumber,
        ifscCode: this.bankForm.value.IFSCCode,
        userId: sessionUser,
        sessionUser,
        upiId: '',
        userName: ''
      }));
    }

    if (wantsUpi) {
      requests.push(this.bankAccountService.add_update_admin_upi({
        siteId,
        userName: this.upiForm.value.UpiName,
        upiId: this.upiForm.value.UpiId,
        userId: sessionUser,
        sessionUser,
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: ''
      }));
    }

    if (wantsQr && this.qrFile) {
      const formParams = new FormData();
      formParams.append('File', this.qrFile);
      formParams.append('userName', this.qrForm.value.QRName);
      formParams.append('userId', sessionUser.toString());
      formParams.append('sessionUser', sessionUser.toString());
      formParams.append('siteId', siteId.toString());
      requests.push(this.bankAccountService.add_admin_qr(formParams));
    }

    let completed = 0;
    let hadError = false;

    requests.forEach((req) => {
      req.subscribe({
        next: (resp: any) => {
          completed++;
          if (resp?.returnStatus != 1) {
            hadError = true;
            this.commonService.toastrMessages(resp);
          }
          if (completed === requests.length) {
            this.saving = false;
            if (!hadError) {
              this.toasterService.success('Payment details saved.');
              this.bsModalRef.hide();
            }
          }
        },
        error: () => {
          completed++;
          hadError = true;
          if (completed === requests.length) {
            this.saving = false;
            this.toasterService.error('Unable to save payment details.');
          }
        }
      });
    });
  }
}
