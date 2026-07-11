import { Component, OnInit } from '@angular/core';
import { apiService } from '../../../api.service';
import { AuthService } from '../../../auth.service';
import { ToastrService } from '../../../toastr/toastr.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-utility-settings',
  templateUrl: './utility-settings.component.html',
  styleUrls: ['./utility-settings.component.css']
})
export class UtilitySettingsComponent implements OnInit {
  loading = true;
  saving = false;
  loadingHistory = false;

  enabled = true;
  phoneNumber = '';
  defaultMessage = '';

  lastUpdatedBy = '';
  lastUpdatedDate = '';

  history: Array<{
    historyId: number;
    settingKey: string;
    oldValue: string;
    newValue: string;
    updatedBy: string;
    updatedDate: string;
  }> = [];

  historyFilter = '';

  constructor(
    private api: apiService,
    private authService: AuthService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadHistory();
  }

  loadSettings(): void {
    this.loading = true;
    this.api.getUtilitySettings().subscribe({
      next: (resp: any) => {
        this.loading = false;
        const list = resp?.returnList ?? resp?.ReturnList ?? [];
        if (!Array.isArray(list) || list.length === 0) {
          this.toaster.warning(resp?.returnMessage ?? 'No utility settings found in database.');
          return;
        }

        let latestDate = '';
        for (const row of list) {
          const key = String(row.settingKey ?? row.SettingKey ?? '').trim();
          const value = String(row.settingValue ?? row.SettingValue ?? '');
          const updatedBy = String(row.updatedBy ?? row.UpdatedBy ?? '');
          const updatedDate = String(row.updatedDate ?? row.UpdatedDate ?? '');

          if (key === 'WhatsApp_Enabled') {
            this.enabled = value.toLowerCase() === 'true' || value === '1';
          } else if (key === 'WhatsApp_PhoneNumber') {
            this.phoneNumber = value;
          } else if (key === 'WhatsApp_DefaultMessage') {
            this.defaultMessage = value;
          }

          if (updatedDate && updatedDate > latestDate) {
            latestDate = updatedDate;
            this.lastUpdatedBy = updatedBy;
            this.lastUpdatedDate = updatedDate;
          }
        }
      },
      error: () => {
        this.loading = false;
        this.toaster.warning('Unable to load utility settings.');
      }
    });
  }

  loadHistory(): void {
    this.loadingHistory = true;
    const key = this.historyFilter?.trim() || undefined;
    this.api.getUtilitySettingHistory(key, 50).subscribe({
      next: (resp: any) => {
        this.loadingHistory = false;
        const list = resp?.returnList ?? resp?.ReturnList ?? [];
        this.history = (Array.isArray(list) ? list : []).map((row: any) => ({
          historyId: Number(row.historyId ?? row.HistoryId ?? 0),
          settingKey: String(row.settingKey ?? row.SettingKey ?? ''),
          oldValue: String(row.oldValue ?? row.OldValue ?? '—'),
          newValue: String(row.newValue ?? row.NewValue ?? ''),
          updatedBy: String(row.updatedBy ?? row.UpdatedBy ?? '—'),
          updatedDate: String(row.updatedDate ?? row.UpdatedDate ?? '')
        }));
      },
      error: () => {
        this.loadingHistory = false;
        this.history = [];
        this.toaster.warning('Unable to load setting history.');
      }
    });
  }

  save(): void {
    const phone = (this.phoneNumber || '').trim();
    const message = (this.defaultMessage || '').trim();

    if (!phone) {
      this.toaster.warning('Enter WhatsApp phone number (digits only, with country code).');
      return;
    }
    if (!/^\d+$/.test(phone)) {
      this.toaster.warning('Phone number must be digits only (example: 919876543210).');
      return;
    }
    if (!message) {
      this.toaster.warning('Enter a default WhatsApp message.');
      return;
    }

    this.saving = true;
    this.api.setUtilitySettings({
      enabled: this.enabled,
      phoneNumber: phone,
      defaultMessage: message,
      sessionUser: this.authService.user.userId
    }).subscribe({
      next: (resp: any) => {
        this.saving = false;
        if ((resp?.returnStatus ?? resp?.ReturnStatus) === 1) {
          // Apply immediately for this session (float button).
          if (environment.whatsapp) {
            environment.whatsapp.enabled = this.enabled;
            environment.whatsapp.phoneNumber = phone;
            environment.whatsapp.defaultMessage = message;
          }
          this.toaster.success(resp?.returnMessage ?? 'WhatsApp settings saved.');
          this.loadSettings();
          this.loadHistory();
        } else {
          this.toaster.warning(resp?.returnMessage ?? 'Unable to save settings.');
        }
      },
      error: () => {
        this.saving = false;
        this.toaster.warning('Unable to save settings.');
      }
    });
  }

  friendlyKey(key: string): string {
    switch (key) {
      case 'WhatsApp_Enabled': return 'Enabled';
      case 'WhatsApp_PhoneNumber': return 'Phone number';
      case 'WhatsApp_DefaultMessage': return 'Default message';
      default: return key;
    }
  }
}
