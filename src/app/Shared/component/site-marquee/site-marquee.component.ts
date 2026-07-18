import { Component } from '@angular/core';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-site-marquee',
  templateUrl: './site-marquee.component.html',
  styleUrls: ['./site-marquee.component.css']
})
export class SiteMarqueeComponent {
  constructor(private appConfig: AppConfigService) {}

  get visible(): boolean {
    return this.appConfig.marquee.enabled && !!this.text;
  }

  get text(): string {
    return this.appConfig.marquee.text;
  }
}
