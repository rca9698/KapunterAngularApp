import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getApkDownloadUrl, getPublicAppUrl, isNativeApp } from './platform.util';
import { NativeShare } from './native-share.plugin';
import { ToastrService } from 'src/app/toastr/toastr.service';

export interface SharePayload {
  title: string;
  text: string;
  url: string;
  dialogTitle?: string;
}

export interface ShareTarget {
  id: string;
  label: string;
  icon: string;
  tone: string;
}

export interface ShareSheetState {
  open: boolean;
  payload: SharePayload | null;
}

export const KAPUNTER_SHARE_TARGETS: ShareTarget[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'bi-whatsapp', tone: 'wa' },
  { id: 'telegram', label: 'Telegram', icon: 'bi-telegram', tone: 'tg' },
  { id: 'sms', label: 'Messages', icon: 'bi-chat-dots-fill', tone: 'sms' },
  { id: 'email', label: 'Email', icon: 'bi-envelope-fill', tone: 'email' },
  { id: 'facebook', label: 'Facebook', icon: 'bi-facebook', tone: 'fb' },
  { id: 'twitter', label: 'X / Twitter', icon: 'bi-twitter-x', tone: 'x' },
  { id: 'copy', label: 'Copy link', icon: 'bi-clipboard', tone: 'copy' },
];

@Injectable({
  providedIn: 'root',
})
export class AppShareService {
  readonly targets = KAPUNTER_SHARE_TARGETS;

  private readonly sheetSubject = new BehaviorSubject<ShareSheetState>({
    open: false,
    payload: null,
  });

  readonly sheet$ = this.sheetSubject.asObservable();

  constructor(private toaster: ToastrService) {}

  get sheet(): ShareSheetState {
    return this.sheetSubject.value;
  }

  /** Default Kapunter app invite (web + APK) for both browser and Android. */
  buildKapunterSharePayload(): SharePayload {
    const webUrl = getPublicAppUrl();
    const apkUrl = getApkDownloadUrl();
    return {
      title: 'Kapunter',
      text:
        `Join Kapunter\n\n` +
        `Open on web:\n${webUrl}\n\n` +
        `Android app (APK):\n${apkUrl}`,
      url: webUrl,
      dialogTitle: 'Share Kapunter via',
    };
  }

  /** Opens the OS share sheet when possible; otherwise the in-app app chooser. */
  async share(payload?: Partial<SharePayload>): Promise<void> {
    const defaults = this.buildKapunterSharePayload();
    const full: SharePayload = {
      title: payload?.title || defaults.title,
      text: payload?.text || defaults.text,
      url: payload?.url || defaults.url,
      dialogTitle: payload?.dialogTitle || defaults.dialogTitle,
    };

    // Native Android — system chooser (WhatsApp, Telegram, Messages, Drive, etc.)
    if (isNativeApp()) {
      try {
        await NativeShare.share({
          title: full.title,
          text: full.text,
          url: full.url,
          dialogTitle: full.dialogTitle,
        });
        return;
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : '';
        if (/cancel|abort/i.test(message)) {
          return;
        }
        // Fall through to web APIs / chooser
      }
    }

    // Mobile browsers with Web Share API
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: full.title,
          text: full.text,
          url: full.url,
        });
        return;
      }
    } catch {
      return; // user cancelled
    }

    // Desktop / unsupported — show app chooser sheet
    this.sheetSubject.next({ open: true, payload: full });
  }

  async shareKapunterApp(): Promise<void> {
    await this.share(this.buildKapunterSharePayload());
  }

  closeSheet(): void {
    this.sheetSubject.next({ open: false, payload: null });
  }

  async shareViaTarget(targetId: string): Promise<void> {
    const payload = this.sheet.payload;
    if (!payload) {
      return;
    }

    const message = payload.text?.trim() || payload.url;
    const encodedText = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(payload.url);
    const encodedTitle = encodeURIComponent(payload.title);

    switch (targetId) {
      case 'whatsapp':
        this.openExternal(`https://wa.me/?text=${encodedText}`);
        break;
      case 'telegram':
        this.openExternal(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`);
        break;
      case 'sms':
        this.openExternal(`sms:?body=${encodedText}`);
        break;
      case 'email':
        this.openExternal(`mailto:?subject=${encodedTitle}&body=${encodedText}`);
        break;
      case 'facebook':
        this.openExternal(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
        break;
      case 'twitter':
        this.openExternal(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`);
        break;
      case 'copy':
        await this.copyText(message);
        break;
      default:
        break;
    }

    this.closeSheet();
  }

  private openExternal(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private async copyText(value: string): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        this.toaster.success('Copied — paste into any app to share');
        return;
      }
    } catch {
      /* fall through */
    }
    window.prompt('Copy this and share in any app:', value);
  }
}
