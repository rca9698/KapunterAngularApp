import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { BrandAwareComponent } from '../brand-aware';
import { SiteConfigService } from '../site-config.service';

@Component({
  selector: 'kw-header',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent extends BrandAwareComponent {
  menuOpen = false;

  readonly links = [
    { path: '/', label: 'Home', exact: true },
    { path: '/features', label: 'Features', exact: false },
    { path: '/guides', label: 'Guides', exact: false },
    { path: '/about', label: 'About', exact: false },
    { path: '/testimonials', label: 'Reviews', exact: false },
    { path: '/faq', label: 'FAQ', exact: false },
    { path: '/contact', label: 'Contact', exact: false }
  ];

  constructor(siteConfig: SiteConfigService) {
    super(siteConfig);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
