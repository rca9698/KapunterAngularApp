import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BrandAwareComponent } from '../brand-aware';
import { SiteConfigService } from '../site-config.service';

@Component({
  selector: 'kw-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent extends BrandAwareComponent {
  readonly currentYear = new Date().getFullYear();

  constructor(siteConfig: SiteConfigService) {
    super(siteConfig);
  }
}
