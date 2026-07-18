import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BrandAwareComponent } from '../../shared/brand-aware';
import { SiteConfigService } from '../../shared/site-config.service';

@Component({
  selector: 'kw-legal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.css']
})
export class LegalComponent extends BrandAwareComponent {
  readonly updatedOn = 'July 2026';

  constructor(siteConfig: SiteConfigService) {
    super(siteConfig);
  }
}
