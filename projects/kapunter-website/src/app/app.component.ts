import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { WhatsappFloatComponent } from './shared/whatsapp-float/whatsapp-float.component';
import { SiteConfigService } from './shared/site-config.service';

@Component({
  selector: 'kw-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, WhatsappFloatComponent],
  template: `
    <kw-header></kw-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <kw-footer></kw-footer>
    <kw-whatsapp-float></kw-whatsapp-float>
  `
})
export class AppComponent implements OnInit {
  constructor(private readonly siteConfig: SiteConfigService) {}

  ngOnInit(): void {
    this.siteConfig.load().subscribe();
  }
}
