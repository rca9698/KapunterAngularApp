import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kp-wordmark',
  templateUrl: './kp-wordmark.component.html',
  styleUrls: ['./kp-wordmark.component.css']
})
export class KpWordmarkComponent {
  /** Visual scale */
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'nav' = 'md';
  /** Accent underline bar (logo-style) */
  @Input() showBar = true;
  /** Left-align for sidebars */
  @Input() align: 'center' | 'start' = 'center';
}
