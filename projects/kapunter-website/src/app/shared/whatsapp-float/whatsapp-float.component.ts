import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { SiteConfig, SiteConfigService } from '../site-config.service';

@Component({
  selector: 'kw-whatsapp-float',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './whatsapp-float.component.html',
  styleUrls: ['./whatsapp-float.component.css']
})
export class WhatsappFloatComponent implements OnInit, OnDestroy {
  config: SiteConfig | null = null;
  href = '';
  hasPhone = false;

  private configSub?: Subscription;

  constructor(private readonly siteConfig: SiteConfigService) {}

  ngOnInit(): void {
    this.configSub = this.siteConfig.asObservable().subscribe(config => {
      this.config = config;
      this.hasPhone = !!String(config.whatsapp?.phoneNumber || '').replace(/\D/g, '');
      this.href = this.siteConfig.whatsappHref(config);
    });
  }

  ngOnDestroy(): void {
    this.configSub?.unsubscribe();
  }

  get visible(): boolean {
    return !!this.config?.whatsapp?.enabled;
  }
}
