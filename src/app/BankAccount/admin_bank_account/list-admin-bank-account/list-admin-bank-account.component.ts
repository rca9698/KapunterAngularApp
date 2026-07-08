import { Component, OnInit } from '@angular/core';
import { Ibank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { BankAccountService } from '../../bank-account.service';
import { add_admin_bank_account } from 'src/app/Shared/Modals/BankAccount/add_admin_bank_account';
import { AuthService } from 'src/app/auth.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { MakeDefaultService } from 'src/app/Shared/Modules/make-default-module/make-default.service';
import { SitesService } from 'src/app/Sites/sites.service';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { ToastrService } from 'src/app/toastr/toastr.service';

@Component({
  selector: 'app-list-admin-bank-account',
  templateUrl: './list-admin-bank-account.component.html',
  styleUrls: ['./list-admin-bank-account.component.css']
})
export class ListAdminBankAccountComponent implements OnInit {
  Ibank_details: Ibank_details[] = [];
  sites: ISiteDetailModal[] = [];
  selectedSiteId: number | null = null;
  selectedSiteName = '';
  loadingSites = true;
  loadingPayments = false;
  returnType: any;
  private readonly _sessionUser: any;

  constructor(
    private bankaccountservice: BankAccountService,
    private authService: AuthService,
    private deleteService: DeleteService,
    private makedefaultservice: MakeDefaultService,
    private sitesService: SitesService,
    private toasterService: ToastrService
  ) {
    this._sessionUser = this.authService.user.userId;
  }

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites(): void {
    this.loadingSites = true;
    this.sitesService.getSiteList({ SessionUser: this._sessionUser }).subscribe({
      next: (resp: any) => {
        if (resp?.returnStatus == 1) {
          this.sites = resp.returnList ?? [];
        } else {
          this.sites = [];
          this.toasterService.warning(resp?.returnMessage || 'Unable to load sites.');
        }
        this.loadingSites = false;
      },
      error: () => {
        this.sites = [];
        this.loadingSites = false;
        this.toasterService.warning('Unable to load sites. Please try again.');
      }
    });
  }

  onSiteChange(siteIdValue: number | string | null): void {
    const siteId = Number(siteIdValue);
    if (!siteId) {
      this.selectedSiteId = null;
      this.selectedSiteName = '';
      this.Ibank_details = [];
      return;
    }

    const site = this.sites.find((s) => Number(s.siteId) === siteId);
    this.selectedSiteId = siteId;
    this.selectedSiteName = site?.siteName ?? '';
    this.list_Admin_Bank_Accounts();
  }

  isDefault(value: any): boolean {
    return value === true || value === 1 || value === '1' || value === 'true';
  }

  AddAdminBankDetailPopup(): void {
    if (!this.selectedSiteId) {
      this.toasterService.warning('Select a site first.');
      return;
    }

    const payload = new add_admin_bank_account();
    payload.siteId = this.selectedSiteId;
    this.bankaccountservice.OpenAddAdminBankAccountPopup(false, payload, this.selectedSiteName);
    this.bankaccountservice.bsmodalRef?.onHidden?.subscribe(() => this.list_Admin_Bank_Accounts());
  }

  MakeAdminBankDefault(obj: any): void {
    this.makedefaultservice.OpenMakeDefaultPopup('adminbank', 'Bank', obj);
  }

  DeleteAdminBankAccount(obj: any): void {
    this.deleteService.OpenDeletePopup('adminbank', 'Bank', obj);
  }

  list_Admin_Bank_Accounts(): void {
    if (!this.selectedSiteId) {
      this.Ibank_details = [];
      return;
    }

    this.loadingPayments = true;
    this.bankaccountservice.list_Admin_Bank_Accounts(this.selectedSiteId).subscribe({
      next: (response) => {
        this.returnType = response;
        this.Ibank_details = this.returnType?.['returnList'] ?? [];
        this.loadingPayments = false;
      },
      error: () => {
        this.Ibank_details = [];
        this.loadingPayments = false;
        this.toasterService.error('Unable to load bank details.');
      }
    });
  }
}
