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

/**
 * Loads assets/app-config.json before bootstrap and merges into `environment`.
 * Same build can serve user/admin or different API URLs by editing this file per folder.
 * Compile-time environment.ts values are used only as fallbacks when a field is missing/empty.
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
    } finally {
      this.loaded = true;
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

    if (config.imagePath && typeof config.imagePath === 'object') {
      const paths = environment.imagePath as Record<string, string>;
      this.assignIfString(paths, 'sitePath', config.imagePath.sitePath);
      this.assignIfString(paths, 'dashboardImages', config.imagePath.dashboardImages);
      this.assignIfString(paths, 'QR', config.imagePath.QR);
      this.assignIfString(paths, 'proofPath', config.imagePath.proofPath);
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
