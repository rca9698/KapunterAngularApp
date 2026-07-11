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

export interface RuntimeWhatsapp {
  enabled?: boolean;
  phoneNumber?: string;
  defaultMessage?: string;
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
 * 2) GET /api/Config/GetPublicConfig — imagePath + whatsapp from AppSetting (Admin → Utility)
 * Compile-time environment.ts values are used only when a field is missing/empty.
 */
@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private loaded = false;

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

  async load(): Promise<void> {
    try {
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
        this.applyImageAndWhatsapp(payload);
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
      env['apiUrl'] = this.trimTrailingSlash(config.apiUrl);
    }

    if (this.isNonEmptyString(config.appUrl)) {
      env['appUrl'] = config.appUrl.trim();
    }

    if (this.isNonEmptyString(config.ueserKey)) {
      env['ueserKey'] = config.ueserKey.trim();
    }

    this.applyImageAndWhatsapp(config);
  }

  private applyImageAndWhatsapp(config: RuntimeAppConfig): void {
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
    }
  }

  private isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private trimTrailingSlash(url: string): string {
    return url.trim().replace(/\/+$/, '');
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
