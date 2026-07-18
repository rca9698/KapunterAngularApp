import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { BrandInfo, BRAND } from './brand';

export interface SiteWhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;
  defaultMessage: string;
}

/**
 * Site-wide configurable settings (redirect links etc).
 *
 * Resolution order — each layer overrides the previous one:
 *   1. Code defaults (BRAND)
 *   2. assets/site-config.json — "appsettings", editable on the server without a rebuild
 *   3. Remote API (optional) — set `configApiUrl` in site-config.json to enable.
 *      The endpoint must return a (partial) SiteConfig JSON body.
 */
export interface SiteConfig {
  appUrl: string;
  apkUrl: string;
  email: string;
  foundedYear: number;
  whatsapp: SiteWhatsAppConfig;
  /** Optional API endpoint that serves overrides for this config. Empty = JSON-only mode. */
  configApiUrl: string;
}

const DEFAULT_CONFIG: SiteConfig = {
  appUrl: BRAND.appUrl,
  apkUrl: BRAND.apkUrl,
  email: BRAND.email,
  foundedYear: BRAND.foundedYear,
  whatsapp: {
    enabled: true,
    phoneNumber: '',
    defaultMessage: 'Hi Kapunter, I need help with my account.'
  },
  configApiUrl: ''
};

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private readonly config$ = new BehaviorSubject<SiteConfig>(DEFAULT_CONFIG);
  private loaded = false;

  /** Reactive brand/link info for templates; emits again when API overrides arrive. */
  readonly brand$: Observable<BrandInfo> = this.config$.pipe(map(config => this.toBrand(config)));

  constructor(private readonly http: HttpClient) {}

  load(): Observable<SiteConfig> {
    if (this.loaded) {
      return of(this.config$.value);
    }

    return this.http.get<Partial<SiteConfig>>('assets/site-config.json').pipe(
      catchError(() => of({} as Partial<SiteConfig>)),
      map(local => this.merge(DEFAULT_CONFIG, local)),
      switchMap(localConfig => this.applyApiOverrides(localConfig)),
      tap(config => {
        this.config$.next(config);
        this.loaded = true;
      })
    );
  }

  get snapshot(): SiteConfig {
    return this.config$.value;
  }

  asObservable(): Observable<SiteConfig> {
    return this.config$.asObservable();
  }

  /** WhatsApp deep link, or app URL when no phone is configured yet. */
  whatsappHref(config: SiteConfig = this.config$.value): string {
    const phone = String(config.whatsapp?.phoneNumber || '').replace(/\D/g, '');
    if (!phone) {
      return config.appUrl;
    }
    const text = encodeURIComponent(config.whatsapp.defaultMessage || '');
    return `https://wa.me/${phone}${text ? `?text=${text}` : ''}`;
  }

  private applyApiOverrides(localConfig: SiteConfig): Observable<SiteConfig> {
    const apiUrl = String(localConfig.configApiUrl || '').trim();
    if (!apiUrl) {
      return of(localConfig);
    }

    return this.http.get<Partial<SiteConfig>>(apiUrl).pipe(
      map(remote => this.merge(localConfig, remote)),
      // API being down must never break the site — fall back to JSON/local values.
      catchError(() => of(localConfig))
    );
  }

  private merge(base: SiteConfig, partial: Partial<SiteConfig>): SiteConfig {
    return {
      ...base,
      ...this.stripEmpty(partial),
      whatsapp: {
        ...base.whatsapp,
        ...this.stripEmpty(partial.whatsapp || {})
      }
    };
  }

  /** Ignore empty strings / null / undefined so partial API responses can't blank out links. */
  private stripEmpty<T extends object>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }
      (result as Record<string, unknown>)[key] = value;
    }
    return result;
  }

  private toBrand(config: SiteConfig): BrandInfo {
    return {
      name: BRAND.name,
      foundedYear: config.foundedYear,
      appUrl: config.appUrl,
      apkUrl: config.apkUrl,
      whatsappUrl: this.whatsappHref(config),
      email: config.email
    };
  }
}
