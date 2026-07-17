import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/api.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';

interface WhatsappNumberRow {
  phoneNumber: string;
  label: string;
  active: boolean;
}

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
  numbers: WhatsappNumberRow[] = [{ phoneNumber: '', label: 'Support', active: true }];
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
        let legacyPhone = '';
        let numbersJson = '';

        for (const row of list) {
          const key = String(row.settingKey ?? row.SettingKey ?? '').trim();
          const value = String(row.settingValue ?? row.SettingValue ?? '');
          const updatedBy = String(row.updatedBy ?? row.UpdatedBy ?? '');
          const updatedDate = String(row.updatedDate ?? row.UpdatedDate ?? '');

          if (key === 'WhatsApp_Enabled') {
            this.enabled = value.toLowerCase() === 'true' || value === '1';
          } else if (key === 'WhatsApp_PhoneNumber') {
            legacyPhone = value;
          } else if (key === 'WhatsApp_DefaultMessage') {
            this.defaultMessage = value;
          } else if (key === 'WhatsApp_Numbers') {
            numbersJson = value;
          }

          if (updatedDate && updatedDate > latestDate) {
            latestDate = updatedDate;
            this.lastUpdatedBy = updatedBy;
            this.lastUpdatedDate = updatedDate;
          }
        }

        this.numbers = this.parseNumbers(numbersJson, legacyPhone);
      },
      error: () => {
        this.loading = false;
        this.toaster.warning('Unable to load utility settings.');
      }
    });
  }

  private parseNumbers(numbersJson: string, legacyPhone: string): WhatsappNumberRow[] {
    if (numbersJson?.trim()) {
      try {
        const parsed = JSON.parse(numbersJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const rows = parsed
            .map((n: any) => ({
              phoneNumber: String(n.phoneNumber ?? n.PhoneNumber ?? '').trim(),
              label: String(n.label ?? n.Label ?? '').trim() || 'Support',
              active: n.active !== false && n.Active !== false
            }))
            .filter((n: WhatsappNumberRow) => !!n.phoneNumber);
          if (rows.length > 0) {
            return rows;
          }
        }
      } catch {
        // Fall through to legacy phone.
      }
    }

    const phone = (legacyPhone || '').trim();
    return [{ phoneNumber: phone, label: 'Support', active: true }];
  }

  addNumber(): void {
    this.numbers = [...this.numbers, { phoneNumber: '', label: '', active: true }];
  }

  removeNumber(index: number): void {
    if (this.numbers.length <= 1) {
      this.toaster.warning('At least one WhatsApp number is required.');
      return;
    }
    this.numbers = this.numbers.filter((_, i) => i !== index);
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
    const message = (this.defaultMessage || '').trim();
    const cleaned = this.numbers
      .map((n) => ({
        phoneNumber: (n.phoneNumber || '').trim(),
        label: (n.label || '').trim() || (n.phoneNumber || '').trim(),
        active: !!n.active
      }))
      .filter((n) => !!n.phoneNumber);

    if (cleaned.length === 0) {
      this.toaster.warning('Add at least one WhatsApp phone number.');
      return;
    }

    for (const n of cleaned) {
      if (!/^\d+$/.test(n.phoneNumber)) {
        this.toaster.warning('Phone numbers must be digits only (example: 919876543210).');
        return;
      }
    }

    if (!cleaned.some((n) => n.active)) {
      this.toaster.warning('At least one WhatsApp number must be active.');
      return;
    }

    if (!message) {
      this.toaster.warning('Enter a default WhatsApp message.');
      return;
    }

    const primary = cleaned.find((n) => n.active)?.phoneNumber ?? cleaned[0].phoneNumber;

    this.saving = true;
    this.api.setUtilitySettings({
      enabled: this.enabled,
      phoneNumber: primary,
      defaultMessage: message,
      numbers: cleaned,
      sessionUser: this.authService.user.userId
    }).subscribe({
      next: (resp: any) => {
        this.saving = false;
        if ((resp?.returnStatus ?? resp?.ReturnStatus) === 1) {
          if (!environment.whatsapp) {
            (environment as any).whatsapp = { enabled: false, phoneNumber: '', defaultMessage: '', numbers: [] };
          }
          environment.whatsapp.enabled = this.enabled;
          environment.whatsapp.phoneNumber = primary;
          environment.whatsapp.defaultMessage = message;
          environment.whatsapp.numbers = cleaned;
          this.numbers = cleaned;
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
      case 'WhatsApp_PhoneNumber': return 'Primary phone';
      case 'WhatsApp_DefaultMessage': return 'Default message';
      case 'WhatsApp_Numbers': return 'Numbers list';
      default: return key;
    }
  }

  previewUrl(phone: string): string {
    const digits = (phone || '').trim();
    if (!digits) {
      return '#';
    }
    const text = encodeURIComponent((this.defaultMessage || '').trim());
    return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
  }

  get activePreviewNumbers(): WhatsappNumberRow[] {
    return this.numbers.filter((n) => n.active && (n.phoneNumber || '').trim());
  }
}
