import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/api.service';
import { AuthService } from 'src/app/auth.service';
import { isNativeApp } from 'src/app/Shared/platform/platform.util';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { ReferralService } from './referral.service';

@Component({
  selector: 'app-refer-earn',
  templateUrl: './refer-earn.component.html',
  styleUrls: ['./refer-earn.component.css'],
})
export class ReferEarnComponent implements OnInit {
  loading = true;
  sharing = false;
  showShareConfirm = false;
  showConfig = false;
  savingConfig = false;
  referralCode = '';
  shareLink = '';
  shareMessage = '';
  apkUrl = '';
  apkShareMessage = '';
  totalReferrals = 0;
  totalEarned = 0;
  rewardAmount = 200;
  configRewardAmount: number | null = 200;
  copiedField: 'link' | 'message' | 'code' | 'apk' | null = null;
  readonly isNativeApp = isNativeApp();
  referrals: Array<{
    referredUserNumber: string;
    rewardAmount: number;
    createdDate: string;
  }> = [];

  constructor(
    private api: apiService,
    public authService: AuthService,
    private toaster: ToastrService,
    private referralService: ReferralService
  ) {}

  get isAdmin(): boolean {
    return this.authService.isadminview();
  }

  ngOnInit(): void {
    this.apkUrl = this.referralService.getApkUrl();
    this.apkShareMessage = this.referralService.buildApkShareMessage();
    this.load();
  }

  load(): void {
    const userId = this.authService.user.userId;
    if (!userId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.api.getReferralSummary({ userId }).subscribe({
      next: (resp: any) => {
        const summary = resp?.returnVal ?? resp?.ReturnVal;
        this.referralCode = summary?.referralCode ?? summary?.ReferralCode ?? '';
        this.totalReferrals = Number(summary?.totalReferrals ?? summary?.TotalReferrals ?? 0);
        this.totalEarned = Number(summary?.totalEarned ?? summary?.TotalEarned ?? 0);
        const reward = Number(summary?.rewardAmount ?? summary?.RewardAmount ?? 0);
        this.rewardAmount = reward > 0 ? reward : 200;
        this.configRewardAmount = this.rewardAmount;
        this.shareLink = this.referralService.buildShareLink(this.referralCode);
        this.apkUrl = this.referralService.getApkUrl();
        this.apkShareMessage = this.referralService.buildApkShareMessage();
        this.shareMessage = this.referralService.buildShareMessage(
          this.referralCode,
          this.shareLink,
          this.rewardAmount
        );
        this.loadList();
      },
      error: () => {
        this.loading = false;
        this.toaster.warning('Unable to load referral details');
      },
    });
  }

  private loadList(): void {
    this.api.listMyReferrals({ userId: this.authService.user.userId }).subscribe({
      next: (resp: any) => {
        this.loading = false;
        const list = resp?.returnList ?? resp?.ReturnList ?? [];
        this.referrals = (list as any[]).map((row) => ({
          referredUserNumber: row.referredUserNumber ?? row.ReferredUserNumber ?? '—',
          rewardAmount: Number(row.rewardAmount ?? row.RewardAmount ?? 0),
          createdDate: row.createdDate ?? row.CreatedDate ?? '',
        }));
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openShareConfirm(): void {
    this.shareMessage = this.referralService.buildShareMessage(
      this.referralCode,
      this.shareLink,
      this.rewardAmount
    );
    this.showShareConfirm = true;
  }

  cancelShare(): void {
    this.showShareConfirm = false;
  }

  async confirmShare(): Promise<void> {
    this.showShareConfirm = false;
    this.sharing = true;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Kapunter Refer & Earn',
          text: this.shareMessage,
          url: this.shareLink,
        });
        this.toaster.success('Invite shared');
      } else {
        await this.copyText(this.shareMessage, 'message');
      }
    } catch {
      /* cancelled */
    } finally {
      this.sharing = false;
    }
  }

  shareWhatsApp(): void {
    const url = `https://wa.me/?text=${encodeURIComponent(this.shareMessage)}`;
    window.open(url, '_blank', 'noopener');
  }

  async copyLink(): Promise<void> {
    await this.copyText(this.shareLink, 'link');
  }

  async copyCode(): Promise<void> {
    await this.copyText(this.referralCode, 'code');
  }

  async copyMessage(): Promise<void> {
    await this.copyText(this.shareMessage, 'message');
  }

  async copyApkLink(): Promise<void> {
    await this.copyText(this.apkUrl, 'apk');
  }

  /** Open the hosted APK for download / install (web). Native app already installed. */
  downloadApk(): void {
    if (!this.apkUrl) {
      this.apkUrl = this.referralService.getApkUrl();
    }
    window.open(this.apkUrl, '_blank', 'noopener');
  }

  async shareApkLink(): Promise<void> {
    if (!this.apkUrl) {
      this.apkUrl = this.referralService.getApkUrl();
    }
    this.apkShareMessage = this.referralService.buildApkShareMessage();
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: 'Kapunter Android App',
          text: this.apkShareMessage,
          url: this.apkUrl,
        });
        this.toaster.success('App install link shared');
        return;
      }
    } catch {
      return;
    }
    await this.copyText(this.apkShareMessage, 'apk');
  }

  private async copyText(value: string, field: 'link' | 'message' | 'code' | 'apk'): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copiedField = field;
      this.toaster.success(
        field === 'link' ? 'Invite link copied' :
        field === 'code' ? 'Referral code copied' :
        field === 'apk' ? 'Android app link copied' :
        'Invite message copied — paste it anywhere'
      );
      setTimeout(() => {
        if (this.copiedField === field) this.copiedField = null;
      }, 1800);
    } catch {
      this.toaster.warning('Unable to copy. Please copy manually.');
    }
  }

  toggleConfig(): void {
    this.showConfig = !this.showConfig;
    this.configRewardAmount = this.rewardAmount;
  }

  saveRewardConfig(): void {
    const amount = Number(this.configRewardAmount);
    if (!amount || amount <= 0) {
      this.toaster.warning('Enter a valid reward amount greater than zero');
      return;
    }
    this.savingConfig = true;
    this.api.setReferralRewardAmount({
      rewardAmount: amount,
      sessionUser: this.authService.user.userId,
    }).subscribe({
      next: (resp: any) => {
        this.savingConfig = false;
        if ((resp?.returnStatus ?? resp?.ReturnStatus) === 1) {
          this.rewardAmount = amount;
          this.shareMessage = this.referralService.buildShareMessage(
            this.referralCode,
            this.shareLink,
            this.rewardAmount
          );
          this.showConfig = false;
          this.toaster.success(resp?.returnMessage ?? 'Referral reward updated');
        } else {
          this.toaster.warning(resp?.returnMessage ?? 'Unable to save reward amount');
        }
      },
      error: () => {
        this.savingConfig = false;
        this.toaster.warning('Unable to save reward amount');
      },
    });
  }
}
