import { registerPlugin, PluginListenerHandle } from '@capacitor/core';

export interface ApkInstallResult {
  needsPermission?: boolean;
  started?: boolean;
}

export interface ApkDownloadProgress {
  percent: number;
  message: string;
}

export interface ApkInstallerPlugin {
  canRequestInstall(): Promise<{ allowed: boolean }>;
  openInstallSettings(): Promise<void>;
  downloadAndInstall(options: { url: string }): Promise<ApkInstallResult>;
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
    async addListener() {
      return { remove: async () => undefined };
    },
  }),
});
