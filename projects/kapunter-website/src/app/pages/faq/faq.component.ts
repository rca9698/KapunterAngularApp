import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BrandAwareComponent } from '../../shared/brand-aware';
import { SiteConfigService } from '../../shared/site-config.service';
import { FAQS } from '../../shared/content';

@Component({
  selector: 'kw-faq',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent extends BrandAwareComponent {
  readonly faqs = FAQS;
  openIndex: number | null = 0;

  constructor(siteConfig: SiteConfigService) {
    super(siteConfig);
  }

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
