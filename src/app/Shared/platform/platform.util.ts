import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';

/** True when running inside the Capacitor / native shell (not browser web). */
export function isNativeApp(): boolean {
  try {
    if (typeof Capacitor !== 'undefined' && typeof Capacitor.isNativePlatform === 'function') {
      return Capacitor.isNativePlatform();
    }
  } catch {
    /* fall through */
  }
  const protocol = typeof window !== 'undefined' ? window.location.protocol : '';
  return protocol === 'capacitor:' || protocol === 'ionic:';
}

/** Canonical public web origin, always ending with `/`. */
export function getPublicAppUrl(): string {
  const raw = (environment.appUrl || (typeof window !== 'undefined' ? window.location.origin + '/' : 'https://kapunter.com/')).trim();
  return raw.replace(/\/?$/, '/');
}

/** Hosted Android APK download URL (web only). */
export function getApkDownloadUrl(): string {
  return `${getPublicAppUrl()}assets/app/kapunter.apk`;
}
