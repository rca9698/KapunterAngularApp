import { registerPlugin, PluginListenerHandle } from '@capacitor/core';

export interface ApkInstallResult {
  needsPermission?: boolean;
  started?: boolean;
  /** True when the APK was downloaded and kept for a resumed install. */
  downloaded?: boolean;
}

export interface ApkInstallDownloadedResult {
  started: boolean;
  hasFile: boolean;
  needsPermission?: boolean;
}

export interface ApkDownloadProgress {
  percent: number;
  message: string;
}

export interface ApkInstallerPlugin {
  canRequestInstall(): Promise<{ allowed: boolean }>;
  openInstallSettings(): Promise<void>;
  downloadAndInstall(options: { url: string }): Promise<ApkInstallResult>;
  /** Installs the APK kept by a previous downloadAndInstall call (auto-resume). */
  installDownloaded(): Promise<ApkInstallDownloadedResult>;
  addListener(
    eventName: 'downloadProgress',
    listenerFunc: (event: ApkDownloadProgress) => void
  ): Promise<PluginListenerHandle>;
}

export const ApkInstaller = registerPlugin<ApkInstallerPlugin>('ApkInstaller', {
  web: () => ({
    async canRequestInstall() {
      return { allowed: false };
    },
    async openInstallSettings() {
      /* no-op on web */
    },
    async downloadAndInstall() {
      return { needsPermission: false, started: false };
    },
    async installDownloaded() {
      return { started: false, hasFile: false };
    },
    async addListener() {
      return { remove: async () => undefined };
    },
  }),
});
