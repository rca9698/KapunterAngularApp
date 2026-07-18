import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { BrandInfo, BRAND } from './brand';
import { SiteConfigService } from './site-config.service';

/**
 * Base class for components that display brand links (app URL, APK, email, WhatsApp).
 * Links resolve from SiteConfigService (defaults → site-config.json → optional API)
 * and update automatically when overrides arrive.
 */
@Directive()
export abstract class BrandAwareComponent implements OnInit, OnDestroy {
  brand: BrandInfo = { ...BRAND };
  years = new Date().getFullYear() - BRAND.foundedYear;

  private brandSub?: Subscription;

  constructor(protected readonly siteConfig: SiteConfigService) {}

  ngOnInit(): void {
    this.brandSub = this.siteConfig.brand$.subscribe(brand => {
      this.brand = brand;
      this.years = new Date().getFullYear() - brand.foundedYear;
      this.onBrandChange(brand);
    });
  }

  ngOnDestroy(): void {
    this.brandSub?.unsubscribe();
  }

  /** Hook for subclasses needing extra work when config resolves. */
  protected onBrandChange(_brand: BrandInfo): void {}
}
