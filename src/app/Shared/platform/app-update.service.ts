import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { getApkDownloadUrl, getAndroidVersionManifestUrl, isNativeApp } from './platform.util';
import { ApkInstaller, ApkDownloadProgress } from './apk-installer.plugin';

export interface AndroidVersionManifest {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  minVersionCode?: number;
  releaseNotes?: string;
  forceUpdate?: boolean;
}

export interface AppUpdateUiState {
  visible: boolean;
  downloading: boolean;
  progress: number;
  message: string;
  versionName: string;
  releaseNotes: string;
  forceUpdate: boolean;
  error: string;
}

const SKIP_KEY = 'kp_apk_update_skip_v';

@Injectable({
  providedIn: 'root',
})
export class AppUpdateService {
  private readonly uiSubject = new BehaviorSubject<AppUpdateUiState>({
    visible: false,
    downloading: false,
    progress: 0,
    message: '',
    versionName: '',
    releaseNotes: '',
    forceUpdate: false,
    error: '',
  });

  readonly ui$ = this.uiSubject.asObservable();

  private remote: AndroidVersionManifest | null = null;
  private localVersionCode = 0;
  private checking = false;

  get ui(): AppUpdateUiState {
    return this.uiSubject.value;
  }

  /** Call once on app open (native Android only). */
  async checkOnLaunch(): Promise<void> {
    if (this.checking || !isNativeApp() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    this.checking = true;
    try {
      const info = await App.getInfo();
      this.localVersionCode = Number(info.build || 0);

      const remote = await this.fetchRemoteManifest();
      if (!remote || !(remote.versionCode > this.localVersionCode)) {
        return;
      }

      this.remote = remote;
      const force =
        !!remote.forceUpdate ||
        (remote.minVersionCode != null && this.localVersionCode < remote.minVersionCode);

      if (!force && this.isSkipped(remote.versionCode)) {
        return;
      }

      this.patchUi({
        visible: true,
        downloading: false,
        progress: 0,
        message: '',
        versionName: remote.versionName || String(remote.versionCode),
        releaseNotes: remote.releaseNotes || 'Bug fixes and improvements.',
        forceUpdate: force,
        error: '',
      });
    } catch {
      /* Silent — never block app open if check fails */
    } finally {
      this.checking = false;
    }
  }

  dismiss(): void {
    if (this.ui.forceUpdate || this.ui.downloading) {
      return;
    }
    if (this.remote) {
      this.skipVersion(this.remote.versionCode);
    }
    this.patchUi({ visible: false, error: '', downloading: false, progress: 0 });
  }

  async startUpdate(): Promise<void> {
    if (!this.remote || this.ui.downloading) {
      return;
    }

    const apkUrl = (this.remote.apkUrl || getApkDownloadUrl()).trim();
    if (!apkUrl) {
      this.patchUi({ error: 'Update URL is missing.' });
      return;
    }

    this.patchUi({
      downloading: true,
      progress: 0,
      message: 'Downloading update…',
      error: '',
    });

    let progressHandle: { remove: () => Promise<void> } | null = null;
    try {
      progressHandle = await ApkInstaller.addListener(
        'downloadProgress',
        (event: ApkDownloadProgress) => {
          this.patchUi({
            progress: event.percent ?? 0,
            message: event.message || 'Downloading update…',
          });
        }
      );

      const permission = await ApkInstaller.canRequestInstall();
      if (!permission.allowed) {
        this.patchUi({
          downloading: false,
          message: '',
          error: 'Allow installs from this app, then tap Update again.',
        });
        await ApkInstaller.openInstallSettings();
        return;
      }

      const result = await ApkInstaller.downloadAndInstall({ url: apkUrl });
      if (result?.needsPermission) {
        this.patchUi({
          downloading: false,
          message: '',
          error: 'Allow installs from this app, then tap Update again.',
        });
        await ApkInstaller.openInstallSettings();
        return;
      }

      this.patchUi({
        downloading: false,
        progress: 100,
        message: 'Install screen opened. Confirm to reinstall.',
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Unable to download update. Try again.';
      this.patchUi({
        downloading: false,
        progress: 0,
        message: '',
        error: message,
      });
    } finally {
      await progressHandle?.remove();
    }
  }

  private async fetchRemoteManifest(): Promise<AndroidVersionManifest | null> {
    const url = `${getAndroidVersionManifestUrl()}?t=${Date.now()}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const versionCode = Number(data?.versionCode ?? data?.VersionCode ?? 0);
    if (!versionCode) {
      return null;
    }
    return {
      versionCode,
      versionName: String(data?.versionName ?? data?.VersionName ?? versionCode),
      apkUrl: String(data?.apkUrl ?? data?.ApkUrl ?? getApkDownloadUrl()),
      minVersionCode: data?.minVersionCode != null ? Number(data.minVersionCode) : undefined,
      releaseNotes: String(data?.releaseNotes ?? data?.ReleaseNotes ?? ''),
      forceUpdate: !!(data?.forceUpdate ?? data?.ForceUpdate),
    };
  }

  private isSkipped(versionCode: number): boolean {
    try {
      const raw = localStorage.getItem(SKIP_KEY);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw) as { versionCode?: number; until?: number };
      if (parsed.versionCode !== versionCode) {
        return false;
      }
      return Number(parsed.until || 0) > Date.now();
    } catch {
      return false;
    }
  }

  private skipVersion(versionCode: number): void {
    try {
      localStorage.setItem(
        SKIP_KEY,
        JSON.stringify({
          versionCode,
          until: Date.now() + 24 * 60 * 60 * 1000,
        })
      );
    } catch {
      /* ignore */
    }
  }

  private patchUi(partial: Partial<AppUpdateUiState>): void {
    this.uiSubject.next({ ...this.uiSubject.value, ...partial });
  }
}
