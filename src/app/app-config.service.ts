import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RuntimeImagePath {
  sitePath?: string;
  dashboardImages?: string;
  QR?: string;
  proofPath?: string;
}

export interface RuntimeWhatsappNumber {
  phoneNumber?: string;
  label?: string;
  active?: boolean;
}

export interface RuntimeWhatsapp {
  enabled?: boolean;
  phoneNumber?: string;
  defaultMessage?: string;
  numbers?: RuntimeWhatsappNumber[];
}

export interface RuntimeMarquee {
  enabled?: boolean;
  text?: string;
}

/** Deploy-time settings from assets/app-config.json (edit without rebuild). */
export interface RuntimeAppConfig {
  environment?: string;
  isAdminSite?: boolean;
  apiUrl?: string;
  appUrl?: string;
  ueserKey?: string;
  imagePath?: RuntimeImagePath;
  whatsapp?: RuntimeWhatsapp;
  marquee?: RuntimeMarquee;
}

interface PublicConfigApiResponse {
  returnStatus?: number;
  ReturnStatus?: number;
  returnVal?: RuntimeAppConfig;
  ReturnVal?: RuntimeAppConfig;
}

/**
 * Loads config before bootstrap:
 * 1) assets/app-config.json — apiUrl / isAdminSite / deploy overrides (and imagePath fallbacks)
 * 2) GET /api/Config/GetPublicConfig — imagePath + whatsapp + marquee from AppSetting (Admin → Utility)
 * Compile-time environment.ts values are used only when a field is missing/empty.
 */
@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private loaded = false;
  private marqueeConfig: Required<RuntimeMarquee> = {
    enabled: false,
    text: ''
  };

  constructor(private http: HttpClient) {}

  get ready(): boolean {
    return this.loaded;
  }

  get isAdminSite(): boolean {
    return !!environment.isAdminSite;
  }

  get apiUrl(): string {
    return environment.apiUrl;
  }

  get marquee(): Readonly<Required<RuntimeMarquee>> {
    return this.marqueeConfig;
  }

  setMarquee(config: RuntimeMarquee): void {
    this.marqueeConfig = {
      enabled: config.enabled === true,
      text: typeof config.text === 'string' ? config.text.trim() : ''
    };
  }

  async load(): Promise<void> {
    try {
      this.ensureRuntimeBuckets();
      await this.loadFileConfig();
      await this.loadDbPublicConfig();
    } finally {
      this.loaded = true;
    }
  }

  private async loadFileConfig(): Promise<void> {
    try {
      const config = await firstValueFrom(
        this.http.get<RuntimeAppConfig>('assets/app-config.json', {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache'
          }
        })
      );
      this.apply(config);
    } catch (err) {
      console.warn('[AppConfig] assets/app-config.json not loaded — using build environment defaults.', err);
    }
  }

  private async loadDbPublicConfig(): Promise<void> {
    const baseUrl = this.trimTrailingSlash(environment.apiUrl || '');
    if (!baseUrl) {
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<PublicConfigApiResponse>(`${baseUrl}/api/Config/GetPublicConfig`, {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache'
          }
        })
      );

      const status = response?.returnStatus ?? response?.ReturnStatus;
      const payload = response?.returnVal ?? response?.ReturnVal;
      if (status === 1 && payload) {
        this.applyPublicRuntimeSettings(payload, true);
      } else {
        console.warn('[AppConfig] GetPublicConfig returned no usable settings — keeping file/environment fallbacks.');
      }
    } catch (err) {
      console.warn('[AppConfig] GetPublicConfig failed — keeping file/environment fallbacks.', err);
    }
  }

  private apply(config: RuntimeAppConfig | null | undefined): void {
    if (!config || typeof config !== 'object') {
      return;
    }

    const env = environment as Record<string, unknown>;

    if (this.isNonEmptyString(config.environment)) {
      env['environment'] = config.environment.trim();
    }

    if (typeof config.isAdminSite === 'boolean') {
      env['isAdminSite'] = config.isAdminSite;
    }

    if (this.isNonEmptyString(config.apiUrl)) {
      env['apiUrl'] = this.normalizeApiUrl(config.apiUrl);
    }

    if (this.isNonEmptyString(config.appUrl)) {
      env['appUrl'] = config.appUrl.trim();
    }

    if (this.isNonEmptyString(config.ueserKey)) {
      env['ueserKey'] = config.ueserKey.trim();
    }

    this.applyPublicRuntimeSettings(config, false);
  }

  private applyPublicRuntimeSettings(config: RuntimeAppConfig, includeBackendOnlySettings: boolean): void {
    this.ensureRuntimeBuckets();

    if (config.imagePath && typeof config.imagePath === 'object') {
      const paths = environment.imagePath as Record<string, string>;
      const apiPaths = config.imagePath as RuntimeImagePath & { qR?: string };
      this.assignIfString(paths, 'sitePath', apiPaths.sitePath);
      this.assignIfString(paths, 'dashboardImages', apiPaths.dashboardImages);
      this.assignIfString(paths, 'QR', apiPaths.QR ?? apiPaths.qR);
      this.assignIfString(paths, 'proofPath', apiPaths.proofPath);
    }

    if (config.whatsapp && typeof config.whatsapp === 'object' && environment.whatsapp) {
      if (typeof config.whatsapp.enabled === 'boolean') {
        environment.whatsapp.enabled = config.whatsapp.enabled;
      }
      if (this.isNonEmptyString(config.whatsapp.phoneNumber)) {
        environment.whatsapp.phoneNumber = config.whatsapp.phoneNumber.trim();
      }
      if (this.isNonEmptyString(config.whatsapp.defaultMessage)) {
        environment.whatsapp.defaultMessage = config.whatsapp.defaultMessage.trim();
      }
      if (Array.isArray(config.whatsapp.numbers)) {
        environment.whatsapp.numbers = config.whatsapp.numbers
          .filter((n) => n && this.isNonEmptyString(n.phoneNumber))
          .map((n) => ({
            phoneNumber: String(n.phoneNumber).trim(),
            label: this.isNonEmptyString(n.label) ? n.label.trim() : String(n.phoneNumber).trim(),
            active: n.active !== false
          }));
      } else if (this.isNonEmptyString(config.whatsapp.phoneNumber)) {
        environment.whatsapp.numbers = [{
          phoneNumber: config.whatsapp.phoneNumber.trim(),
          label: 'Support',
          active: true
        }];
      }
    }

    if (includeBackendOnlySettings && config.marquee && typeof config.marquee === 'object') {
      this.setMarquee(config.marquee);
    }
  }

  private ensureRuntimeBuckets(): void {
    const env = environment as Record<string, unknown>;
    if (!env['imagePath'] || typeof env['imagePath'] !== 'object') {
      env['imagePath'] = { sitePath: '', dashboardImages: '', QR: '', proofPath: '' };
    }
    if (!env['whatsapp'] || typeof env['whatsapp'] !== 'object') {
      env['whatsapp'] = { enabled: false, phoneNumber: '', defaultMessage: '', numbers: [] };
    } else if (!Array.isArray((env['whatsapp'] as RuntimeWhatsapp).numbers)) {
      (env['whatsapp'] as RuntimeWhatsapp).numbers = [];
    }
  }

  private isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private trimTrailingSlash(url: string): string {
    return url.trim().replace(/\/+$/, '');
  }

  /**
   * Android APK blocks cleartext HTTP by default. Production Kapunter API is HTTPS-only
   * (http://api.kapunter.com times out / is rejected on device).
   */
  private normalizeApiUrl(url: string): string {
    let normalized = this.trimTrailingSlash(url);
    try {
      const parsed = new URL(normalized);
      const host = parsed.hostname.toLowerCase();
      if (
        parsed.protocol === 'http:' &&
        (host === 'api.kapunter.com' || host.endsWith('.kapunter.com'))
      ) {
        parsed.protocol = 'https:';
        normalized = this.trimTrailingSlash(parsed.toString());
        console.warn('[AppConfig] Upgraded apiUrl to HTTPS for Android/native compatibility:', normalized);
      }
    } catch {
      /* keep trimmed value */
    }
    return normalized;
  }

  private assignIfString(target: Record<string, string>, key: string, value: unknown): void {
    if (this.isNonEmptyString(value)) {
      target[key] = value.trim();
    }
  }
}

export function appConfigInitializer(appConfig: AppConfigService): () => Promise<void> {
  return () => appConfig.load();
}
