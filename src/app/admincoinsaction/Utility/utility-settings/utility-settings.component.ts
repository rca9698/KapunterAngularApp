import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/api.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-utility-settings',
  templateUrl: './utility-settings.component.html',
  styleUrls: ['./utility-settings.component.css']
})
export class UtilitySettingsComponent implements OnInit {
  activeTab: 'whatsapp' | 'bonus' = 'whatsapp';

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

  bonusSearch = '';
  bonusLoading = false;
  bonusActing = false;
  bonusUsers: Array<{
    userId: number;
    userNumber: string;
    fullName: string;
    availableBonus: number;
    pendingBonus: number;
    totalBonus: number;
  }> = [];
  creditUserId: number | null = null;
  creditAmount: number | null = null;
  creditRemarks = '';
  selectedBonusUserId: number | null = null;
  bonusHistory: Array<{
    actionType: string;
    amount: number;
    remarks: string;
    createdDate: string;
    createdBy: string;
  }> = [];

  constructor(
    private api: apiService,
    private authService: AuthService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadHistory();
    this.loadBonusUsers();
  }

  setTab(tab: 'whatsapp' | 'bonus'): void {
    this.activeTab = tab;
    if (tab === 'bonus') {
      this.loadBonusUsers();
    }
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
      }
    });
  }

  save(): void {
    const phone = (this.phoneNumber || '').trim();
    const message = (this.defaultMessage || '').trim();

    if (!phone || !/^\d+$/.test(phone)) {
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
          if (!environment.whatsapp) {
            (environment as any).whatsapp = { enabled: false, phoneNumber: '', defaultMessage: '' };
          }
          environment.whatsapp.enabled = this.enabled;
          environment.whatsapp.phoneNumber = phone;
          environment.whatsapp.defaultMessage = message;
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

  loadBonusUsers(): void {
    this.bonusLoading = true;
    this.api.listUsersBonus(this.bonusSearch?.trim() || undefined).subscribe({
      next: (resp: any) => {
        this.bonusLoading = false;
        const list = resp?.returnList ?? resp?.ReturnList ?? [];
        this.bonusUsers = (Array.isArray(list) ? list : []).map((row: any) => ({
          userId: Number(row.userId ?? row.UserId ?? 0),
          userNumber: String(row.userNumber ?? row.UserNumber ?? ''),
          fullName: String(row.fullName ?? row.FullName ?? ''),
          availableBonus: Number(row.availableBonus ?? row.AvailableBonus ?? 0),
          pendingBonus: Number(row.pendingBonus ?? row.PendingBonus ?? 0),
          totalBonus: Number(row.totalBonus ?? row.TotalBonus ?? 0)
        }));
      },
      error: () => {
        this.bonusLoading = false;
        this.bonusUsers = [];
      }
    });
  }

  creditBonus(): void {
    const userId = Number(this.creditUserId);
    const amount = Number(this.creditAmount);
    if (!userId || userId <= 0 || !amount || amount <= 0) {
      this.toaster.warning('Enter a valid user id and positive amount.');
      return;
    }
    this.bonusActing = true;
    this.api.creditBonus({
      userId,
      amount,
      remarks: this.creditRemarks?.trim() || undefined,
      sessionUser: this.authService.user.userId
    }).subscribe({
      next: (resp: any) => {
        this.bonusActing = false;
        if ((resp?.returnStatus ?? resp?.ReturnStatus) === 1) {
          this.toaster.success(resp?.returnMessage ?? 'Bonus credited.');
          this.creditAmount = null;
          this.creditRemarks = '';
          this.loadBonusUsers();
          this.selectBonusUser(userId);
        } else {
          this.toaster.warning(resp?.returnMessage ?? 'Unable to credit bonus.');
        }
      },
      error: () => {
        this.bonusActing = false;
        this.toaster.warning('Unable to credit bonus.');
      }
    });
  }

  withdrawBonus(userId: number): void {
    if (!confirm('Withdraw all available bonus for this user? It will show as pending until settled.')) {
      return;
    }
    this.bonusActing = true;
    this.api.withdrawBonus({
      userId,
      sessionUser: this.authService.user.userId
    }).subscribe({
      next: (resp: any) => {
        this.bonusActing = false;
        if ((resp?.returnStatus ?? resp?.ReturnStatus) === 1) {
          this.toaster.success(resp?.returnMessage ?? 'Bonus moved to pending.');
          this.loadBonusUsers();
          this.selectBonusUser(userId);
        } else {
          this.toaster.warning(resp?.returnMessage ?? 'Unable to withdraw bonus.');
        }
      },
      error: () => {
        this.bonusActing = false;
        this.toaster.warning('Unable to withdraw bonus.');
      }
    });
  }

  settleBonus(userId: number): void {
    if (!confirm('Mark pending bonus as settled/paid for this user?')) {
      return;
    }
    this.bonusActing = true;
    this.api.settleBonus({
      userId,
      sessionUser: this.authService.user.userId
    }).subscribe({
      next: (resp: any) => {
        this.bonusActing = false;
        if ((resp?.returnStatus ?? resp?.ReturnStatus) === 1) {
          this.toaster.success(resp?.returnMessage ?? 'Bonus settled.');
          this.loadBonusUsers();
          this.selectBonusUser(userId);
        } else {
          this.toaster.warning(resp?.returnMessage ?? 'Unable to settle bonus.');
        }
      },
      error: () => {
        this.bonusActing = false;
        this.toaster.warning('Unable to settle bonus.');
      }
    });
  }

  selectBonusUser(userId: number): void {
    this.selectedBonusUserId = userId;
    this.api.getUserBonusHistory(userId, 30).subscribe({
      next: (resp: any) => {
        const list = resp?.returnList ?? resp?.ReturnList ?? [];
        this.bonusHistory = (Array.isArray(list) ? list : []).map((row: any) => ({
          actionType: String(row.actionType ?? row.ActionType ?? ''),
          amount: Number(row.amount ?? row.Amount ?? 0),
          remarks: String(row.remarks ?? row.Remarks ?? ''),
          createdDate: String(row.createdDate ?? row.CreatedDate ?? ''),
          createdBy: String(row.createdBy ?? row.CreatedBy ?? '')
        }));
      },
      error: () => {
        this.bonusHistory = [];
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

  get whatsAppPreviewUrl(): string {
    const phone = (this.phoneNumber || '').trim();
    if (!phone) {
      return '#';
    }
    const text = encodeURIComponent((this.defaultMessage || '').trim());
    return `https://wa.me/${phone}${text ? `?text=${text}` : ''}`;
  }
}
