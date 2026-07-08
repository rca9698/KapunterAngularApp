import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CoinsService } from '../../admincoinsaction/coins/coins.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { AuthService } from 'src/app/auth.service';
import { Ibank_details, bank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-deposite-coins-request',
  templateUrl: './deposite-coins-request.component.html',
  styleUrls: ['./deposite-coins-request.component.css']
})
export class DepositeCoinsRequestComponent {

  readonly minDepositCoins = 500;

  title: string | undefined;
  site: any;
  depositeCoinRequestFrom: FormGroup;
   submitted : boolean = false;
   file: File | null = null;
   selectedFileName: string | null = null;
   returnType: any;
   private readonly _sessionUser: bigint;
   adminBankDetail: Ibank_details = new bank_details();
   qrPath: string | undefined;
   qrImageUrl = '';
   paymentDetailLoading = false;
   
   QRCodeDetail:boolean = false;
   BankTrDetail:boolean = false;
   PhonePeDetail:boolean = false;

   backButtonVisibility: boolean = true;
   depositecoinsproofupload: boolean = false;
   depositecoinsdetails: boolean = true;
   paymentModeListView: boolean = true;
   paymentModeTypesDetailListView: boolean = true;

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private coinsservice: CoinsService, 
    private toasterService: ToastrService, public authservice: AuthService) {
      this.depositeCoinRequestFrom = this.formBuilder.group({
        coins: ['', [Validators.required, Validators.min(this.minDepositCoins)]]
       },
     )
     this._sessionUser = this.authservice.user.userId;
     this.qrPath = environment.imagePath.QR;
  }

  processFile(imageInput: HTMLInputElement) {
    const f = imageInput.files?.[0];
    this.file = f ?? null;
    this.selectedFileName = f?.name ?? null;
  }

  backToAddCoins(){
    this.depositecoinsdetails = true;
    this.depositecoinsproofupload = false;
  }

  DepositCoinsRequestAmount(){
    this.submitted = true;
  
    if(this.depositeCoinRequestFrom.invalid) {
      return;
    }
    
    this.depositecoinsdetails = false;
    this.depositecoinsproofupload = true;
  }

  DepositCoinsRequest(){
    if(this.depositeCoinRequestFrom.invalid || !this.file) {
      return;
    }

    let formParams = new FormData();
    formParams.append('File', this.file);
    formParams.append('coins', this.depositeCoinRequestFrom.value["coins"]);
    formParams.append('userid', this._sessionUser.toString());
    formParams.append('sessionuser', this._sessionUser.toString());
    formParams.append('accountId', this.site.accountId);

    this.coinsservice.add_coin_to_site_request_insert(formParams).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.bsModalRef.hide();
      },
      error:error => {
        console.log(error);
      }
    });
  }

  downloadQRCode(): void {
    if (!this.qrImageUrl) {
      this.toasterService.warning('QR code not available.');
      return;
    }

    const extension = this.normalizeExtension(this.adminBankDetail.fileExtenstion);
    const fileName = `qr_code_${this.depositeCoinRequestFrom.value['coins']}.${extension}`;

    fetch(this.qrImageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(blobUrl);
        this.toasterService.success('QR code downloaded.');
      })
      .catch(() => {
        const link = document.createElement('a');
        link.href = this.qrImageUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.click();
        this.toasterService.warning('Opening QR code in a new tab.');
      });
  }

  PaymentDataView(type: string): void {
    this.QRCodeDetail = false;
    this.BankTrDetail = false;
    this.PhonePeDetail = false;
    this.qrImageUrl = '';

    if (type === 'QRCodeDetail') {
      this.QRCodeDetail = true;
      this.loadAdminQrDetail();
      return;
    }

    if (type === 'BankTrDetail') {
      this.BankTrDetail = true;
      this.loadAdminBankDetail();
      return;
    }

    if (type === 'PhonePeDetail') {
      this.PhonePeDetail = true;
      this.loadAdminUpiDetail();
    }
  }

  copyToClipboard(value: string | undefined): void {
    if (!value?.trim()) {
      return;
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(() => {
        this.toasterService.success('Copied to clipboard.');
      }).catch(() => this.fallbackCopy(value));
      return;
    }

    this.fallbackCopy(value);
  }

  private getDepositSiteId(): number | null {
    const siteId = Number(this.site?.siteId);
    return siteId > 0 ? siteId : null;
  }

  private loadAdminQrDetail(): void {
    const siteId = this.getDepositSiteId();
    if (!siteId) {
      this.toasterService.warning('Site is required to load QR code.');
      return;
    }

    this.paymentDetailLoading = true;
    this.coinsservice.get_admin_qr_details(siteId).subscribe({
      next: (response) => {
        this.adminBankDetail = this.extractPaymentDetail(response) ?? new bank_details();
        this.qrImageUrl = this.buildQrImageUrl(this.adminBankDetail);
        this.paymentDetailLoading = false;

        if (!this.qrImageUrl) {
          this.toasterService.warning('QR code not available.');
        }
      },
      error: () => {
        this.paymentDetailLoading = false;
        this.toasterService.error('Unable to load QR code.');
      }
    });
  }

  private loadAdminBankDetail(): void {
    const siteId = this.getDepositSiteId();
    if (!siteId) {
      this.toasterService.warning('Site is required to load bank details.');
      return;
    }

    this.paymentDetailLoading = true;
    this.coinsservice.get_bank_UPI_details(siteId).subscribe({
      next: (response) => {
        this.adminBankDetail = this.extractPaymentDetail(response) ?? new bank_details();
        this.paymentDetailLoading = false;

        if (!this.adminBankDetail.bankName) {
          this.toasterService.warning('Bank details not available.');
        }
      },
      error: () => {
        this.paymentDetailLoading = false;
        this.toasterService.error('Unable to load bank details.');
      }
    });
  }

  private loadAdminUpiDetail(): void {
    const siteId = this.getDepositSiteId();
    if (!siteId) {
      this.toasterService.warning('Site is required to load UPI details.');
      return;
    }

    this.paymentDetailLoading = true;
    this.coinsservice.get_admin_upi_details(siteId).subscribe({
      next: (response) => {
        this.adminBankDetail = this.extractPaymentDetail(response) ?? new bank_details();
        this.paymentDetailLoading = false;

        if (!this.adminBankDetail.upiId) {
          this.toasterService.warning('UPI details not available.');
        }
      },
      error: () => {
        this.paymentDetailLoading = false;
        this.toasterService.error('Unable to load UPI details.');
      }
    });
  }

  private extractPaymentDetail(response: any): Ibank_details | null {
    if (response?.returnStatus !== 1) {
      return null;
    }

    if (response.returnVal) {
      return response.returnVal;
    }

    const list = response.returnList as Ibank_details[] | undefined;
    if (!list?.length) {
      return null;
    }

    return list.find((item) => item.isDefault === '1' || item.isDefault === 'true' || (item as any).isDefault === true) ?? list[0];
  }

  private buildQrImageUrl(detail: Ibank_details): string {
    if (!detail?.documentDetailId || !detail?.fileExtenstion) {
      return '';
    }

    return `${this.qrPath}${detail.documentDetailId}.${this.normalizeExtension(detail.fileExtenstion)}`;
  }

  private normalizeExtension(extension: string): string {
    return extension.replace(/^\./, '');
  }

  private fallbackCopy(value: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.toasterService.success('Copied to clipboard.');
  }
}
