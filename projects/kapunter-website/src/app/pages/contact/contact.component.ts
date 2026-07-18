import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

import { BrandAwareComponent } from '../../shared/brand-aware';
import { BrandInfo } from '../../shared/brand';
import { SiteConfigService } from '../../shared/site-config.service';

@Component({
  selector: 'kw-contact',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent extends BrandAwareComponent {
  whatsappHref = '';
  hasWhatsAppPhone = false;

  form = {
    name: '',
    mobile: '',
    topic: 'General enquiry',
    message: ''
  };

  submitted = false;

  constructor(siteConfig: SiteConfigService) {
    super(siteConfig);
  }

  protected override onBrandChange(brand: BrandInfo): void {
    const config = this.siteConfig.snapshot;
    this.whatsappHref = this.siteConfig.whatsappHref(config);
    this.hasWhatsAppPhone = !!String(config.whatsapp?.phoneNumber || '').replace(/\D/g, '');
  }

  submit(): void {
    if (!this.form.name.trim() || !this.form.mobile.trim() || !this.form.message.trim()) {
      return;
    }

    // Frontend-only for now — ready to wire to an API endpoint later.
    this.submitted = true;
    this.form = { name: '', mobile: '', topic: 'General enquiry', message: '' };
  }
}
