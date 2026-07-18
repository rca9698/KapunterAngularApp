import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BRAND } from '../brand';

@Component({
  selector: 'kw-cta-band',
  standalone: true,
  imports: [NgIf, RouterLink],
  template: `
    <section class="kw-section">
      <div class="kw-container">
        <div class="kw-cta">
          <div>
            <h2>{{ title }}</h2>
            <p>{{ subtitle }}</p>
          </div>
          <div class="kw-cta__actions">
            <a class="kw-btn kw-btn--primary" [href]="primaryHref" [attr.target]="primaryExternal ? '_blank' : null" rel="noopener">
              {{ primaryLabel }}
            </a>
            <a
              *ngIf="secondaryRouterLink; else secondaryHrefTpl"
              class="kw-btn kw-btn--ghost"
              [routerLink]="secondaryRouterLink">
              {{ secondaryLabel }}
            </a>
            <ng-template #secondaryHrefTpl>
              <a *ngIf="secondaryHref" class="kw-btn kw-btn--ghost" [href]="secondaryHref">{{ secondaryLabel }}</a>
            </ng-template>
          </div>
        </div>
      </div>
    </section>
  `
})
export class CtaBandComponent {
  @Input() title = 'Ready to play with confidence?';
  @Input() subtitle = 'Join Kapunter today — instant deposits, 45-minute withdrawals and support whenever you need it.';
  @Input() primaryLabel = 'Get Started';
  @Input() primaryHref = BRAND.appUrl;
  @Input() primaryExternal = true;
  @Input() secondaryLabel = 'Talk to Support';
  @Input() secondaryRouterLink: string | null = '/contact';
  @Input() secondaryHref: string | null = null;
}
