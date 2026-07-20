import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BrandAwareComponent } from '../../shared/brand-aware';
import { SiteConfigService } from '../../shared/site-config.service';
import { CtaBandComponent } from '../../shared/cta-band/cta-band.component';
import {
  GUIDE_MODULES,
  HIGHLIGHTS,
  HOW_IT_WORKS,
  STATS,
  TESTIMONIALS
} from '../../shared/content';

@Component({
  selector: 'kw-home',
  standalone: true,
  imports: [NgFor, RouterLink, CtaBandComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BrandAwareComponent {
  readonly stats = STATS;
  readonly highlights = HIGHLIGHTS;
  readonly steps = HOW_IT_WORKS;
  readonly testimonials = TESTIMONIALS.slice(0, 3);
  readonly guideTeasers = GUIDE_MODULES.slice(0, 3);

  constructor(siteConfig: SiteConfigService) {
    super(siteConfig);
  }

  stars(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }
}
