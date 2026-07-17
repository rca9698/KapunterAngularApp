import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { apiService } from 'src/app/api.service';
import { getApkDownloadUrl, getPublicAppUrl } from 'src/app/Shared/platform/platform.util';

const REF_STORAGE_KEY = 'kapunter_pending_ref';
const REF_BANNER_DISMISSED = 'kapunter_ref_banner_dismissed';

@Injectable({
  providedIn: 'root',
})
export class ReferralService {
  private readonly _pendingCode = new BehaviorSubject<string | null>(null);
  private readonly _rewardAmount = new BehaviorSubject<number>(200);
  private readonly _showInviteBanner = new BehaviorSubject<boolean>(false);

  readonly pendingCode$ = this._pendingCode.asObservable();
  readonly rewardAmount$ = this._rewardAmount.asObservable();
  readonly showInviteBanner$ = this._showInviteBanner.asObservable();

  constructor(private api: apiService) {
    const existing = (localStorage.getItem(REF_STORAGE_KEY) || '').trim().toUpperCase();
    if (existing) {
      this._pendingCode.next(existing);
    }
  }

  get pendingCode(): string | null {
    return this._pendingCode.value;
  }

  get rewardAmount(): number {
    return this._rewardAmount.value;
  }

  get showInviteBanner(): boolean {
    return this._showInviteBanner.value;
  }

  /** Capture ?ref= / ?referral= and prepare invite activity. */
  captureFromUrl(search: string = window.location.search): string | null {
    try {
      const params = new URLSearchParams(search);
      const ref = (params.get('ref') || params.get('referral') || '').trim().toUpperCase();
      if (!ref) {
        return this._pendingCode.value;
      }
      localStorage.setItem(REF_STORAGE_KEY, ref);
      localStorage.removeItem(REF_BANNER_DISMISSED);
      this._pendingCode.next(ref);
      this._showInviteBanner.next(true);
      this.loadRewardAmount();
      return ref;
    } catch {
      return null;
    }
  }

  loadRewardAmount(): void {
    this.api.getReferralRewardAmount().subscribe({
      next: (resp: any) => {
        const val = resp?.returnVal ?? resp?.ReturnVal;
        const raw = val?.settingValue ?? val?.SettingValue ?? '200';
        const amount = Number(raw);
        this._rewardAmount.next(amount > 0 ? amount : 200);
      },
      error: () => this._rewardAmount.next(200),
    });
  }

  clearPending(): void {
    localStorage.removeItem(REF_STORAGE_KEY);
    this._pendingCode.next(null);
    this._showInviteBanner.next(false);
  }

  dismissBanner(): void {
    localStorage.setItem(REF_BANNER_DISMISSED, '1');
    this._showInviteBanner.next(false);
  }

  /** Show banner again if pending ref exists and not dismissed this session. */
  refreshBannerVisibility(isLoggedIn: boolean): void {
    const code = this._pendingCode.value;
    const dismissed = localStorage.getItem(REF_BANNER_DISMISSED) === '1';
    this._showInviteBanner.next(!!code && !isLoggedIn && !dismissed);
  }

  buildShareMessage(code: string, link: string, reward: number): string {
    const apkUrl = getApkDownloadUrl();
    return (
      `You're invited to Kapunter\n\n` +
      `1) Open your personal invite link and complete first login (OTP or password).\n` +
      `2) Prefer the mobile app? Install the Android APK, then open the same invite link.\n\n` +
      `Invite link:\n${link}\n\n` +
      `Android app (APK):\n${apkUrl}\n\n` +
      `Invite code: ${code}\n` +
      `After your first successful login, I earn ₹${reward}.`
    );
  }

  /** Always use the public web URL so invites work from browser and native app. */
  buildShareLink(code: string): string {
    return `${getPublicAppUrl()}?ref=${encodeURIComponent(code)}`;
  }

  /** Direct APK download URL for install / share. */
  getApkUrl(): string {
    return getApkDownloadUrl();
  }

  buildApkShareMessage(): string {
    const apkUrl = getApkDownloadUrl();
    return (
      `Install Kapunter for Android\n\n` +
      `Download the official APK and install it on your phone:\n` +
      `${apkUrl}\n\n` +
      `After installing, open the app and log in with your mobile number.`
    );
  }
}
