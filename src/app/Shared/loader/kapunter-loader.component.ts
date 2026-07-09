import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kapunter-loader',
  templateUrl: './kapunter-loader.component.html',
  styleUrls: ['./kapunter-loader.component.css'],
})
export class KapunterLoaderComponent {
  /** sm | md | lg */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  /** Horizontal inline row instead of stacked panel */
  @Input() inline = false;
  /** Overlay only the parent container (position: relative required) */
  @Input() overlay = false;
  @Input() message = 'Loading…';
  @Input() showMessage = true;
}
