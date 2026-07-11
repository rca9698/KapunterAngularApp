import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RuntimeAppConfig {
  isAdminSite?: boolean;
  apiUrl?: string;
  appUrl?: string;
  ueserKey?: string;
  whatsapp?: {
    enabled?: boolean;
    phoneNumber?: string;
    defaultMessage?: string;
  };
}

/**
 * Loads assets/app-config.json at startup so deploy folders can flip
 * isAdminSite / apiUrl without rebuilding Angular.
 */
@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private loaded = false;

  constructor(private http: HttpClient) {}

  /** True after runtime config has been applied (or failed open). */
  get ready(): boolean {
    return this.loaded;
  }

  get isAdminSite(): boolean {
    return !!environment.isAdminSite;
  }

  async load(): Promise<void> {
    try {
      const config = await firstValueFrom(
        this.http.get<RuntimeAppConfig>('assets/app-config.json', {
          headers: { 'Cache-Control': 'no-cache' }
        })
      );
      this.apply(config);
    } catch {
      // Keep compile-time environment defaults when file is missing.
    } finally {
      this.loaded = true;
    }
  }

  private apply(config: RuntimeAppConfig | null | undefined): void {
    if (!config || typeof config !== 'object') {
      return;
    }

    if (typeof config.isAdminSite === 'boolean') {
      (environment as { isAdminSite: boolean }).isAdminSite = config.isAdminSite;
    }

    if (typeof config.apiUrl === 'string' && config.apiUrl.trim()) {
      (environment as { apiUrl: string }).apiUrl = config.apiUrl.trim().replace(/\/$/, '');
    }

    if (typeof config.appUrl === 'string' && config.appUrl.trim()) {
      (environment as { appUrl: string }).appUrl = config.appUrl.trim();
    }

    if (typeof config.ueserKey === 'string' && config.ueserKey.trim()) {
      (environment as { ueserKey: string }).ueserKey = config.ueserKey.trim();
    }

    if (config.whatsapp && environment.whatsapp) {
      if (typeof config.whatsapp.enabled === 'boolean') {
        environment.whatsapp.enabled = config.whatsapp.enabled;
      }
      if (typeof config.whatsapp.phoneNumber === 'string' && config.whatsapp.phoneNumber.trim()) {
        environment.whatsapp.phoneNumber = config.whatsapp.phoneNumber.trim();
      }
      if (typeof config.whatsapp.defaultMessage === 'string' && config.whatsapp.defaultMessage.trim()) {
        environment.whatsapp.defaultMessage = config.whatsapp.defaultMessage.trim();
      }
    }
  }
}

export function appConfigInitializer(appConfig: AppConfigService): () => Promise<void> {
  return () => appConfig.load();
}
