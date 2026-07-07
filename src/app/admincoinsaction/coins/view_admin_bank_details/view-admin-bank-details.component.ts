import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { ToastrService } from 'src/app/toastr/toastr.service';

interface IBankDetailField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-view-admin-bank-details',
  templateUrl: './view-admin-bank-details.component.html',
  styleUrls: ['./view-admin-bank-details.component.css']
})
export class ViewAdminBankDetailsComponent implements OnInit {
  obj!: Ibank_details;
  fields: IBankDetailField[] = [];

  constructor(
    public bsModalRef: BsModalRef,
    private toasterService: ToastrService
  ) {}

  ngOnInit(): void {
    this.fields = this.buildFields();
  }

  copyField(value: string): void {
    if (!value?.trim()) {
      return;
    }
    this.copyToClipboard(value);
  }

  copyAll(): void {
    if (this.fields.length === 0) {
      return;
    }

    const text = this.fields.map((field) => `${field.label}: ${field.value}`).join('\n');
    this.copyToClipboard(text);
  }

  private buildFields(): IBankDetailField[] {
    if (!this.obj) {
      return [];
    }

    const items: IBankDetailField[] = [
      { label: 'Account Holder Name', value: this.obj.accountHolderName },
      { label: 'Bank Name', value: this.obj.bankName },
      { label: 'Account Number', value: this.obj.accountNumber },
      { label: 'IFSC Code', value: this.obj.ifscCode },
      { label: 'UPI ID', value: this.obj.upiId },
      { label: 'Account Display Name', value: this.obj.accountDisplayName },
    ];

    return items.filter((item) => !!item.value?.trim());
  }

  private copyToClipboard(text: string): void {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.toasterService.success('Copied to clipboard.');
      }).catch(() => this.fallbackCopy(text));
      return;
    }

    this.fallbackCopy(text);
  }

  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.toasterService.success('Copied to clipboard.');
  }
}
