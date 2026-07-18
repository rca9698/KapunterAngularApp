import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BrandAwareComponent } from '../../shared/brand-aware';
import { SiteConfigService } from '../../shared/site-config.service';
import { TESTIMONIALS } from '../../shared/content';

@Component({
  selector: 'kw-testimonials',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent extends BrandAwareComponent {
  readonly testimonials = TESTIMONIALS;

  constructor(siteConfig: SiteConfigService) {
    super(siteConfig);
  }

  stars(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }
}
