import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BrandAwareComponent } from '../../shared/brand-aware';
import { SiteConfigService } from '../../shared/site-config.service';
import { STATS } from '../../shared/content';

@Component({
  selector: 'kw-about',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent extends BrandAwareComponent {
  readonly stats = STATS;

  readonly values = [
    {
      title: 'Player first',
      description: 'Every product decision starts with the player experience — speed, clarity and fairness over complexity.'
    },
    {
      title: 'Operational excellence',
      description: 'A 45-minute withdrawal guarantee is only meaningful when operations, banking and support run like clockwork.'
    },
    {
      title: 'Transparency',
      description: 'Passbooks, request statuses and notifications keep every rupee and every ID action visible to the user.'
    },
    {
      title: 'Responsible gaming',
      description: 'Kapunter is for adults 18+. We promote responsible play and provide clear terms so users stay informed.'
    }
  ];

  constructor(siteConfig: SiteConfigService) {
    super(siteConfig);
  }
}
