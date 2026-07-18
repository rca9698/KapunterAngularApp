import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BrandAwareComponent } from '../../shared/brand-aware';
import { SiteConfigService } from '../../shared/site-config.service';
import { FEATURES } from '../../shared/content';

@Component({
  selector: 'kw-features',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent extends BrandAwareComponent {
  readonly features = FEATURES;

  constructor(siteConfig: SiteConfigService) {
    super(siteConfig);
  }
}
