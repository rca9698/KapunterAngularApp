import { Directive, HostBinding, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SingleClickActivityService } from './single-click-activity.service';

/**
 * Optional UI companion to the product-level interceptor.
 * Blocks extra clicks on the host while any activity mutation is in flight.
 *
 * Usage: <button type="button" appSingleClick (click)="submit()">Submit</button>
 */
@Directive({
  selector: 'button[appSingleClick], a[appSingleClick], input[appSingleClick]',
})
export class SingleClickDirective implements OnInit, OnDestroy {
  private busy = false;
  private sub?: Subscription;

  constructor(private singleClick: SingleClickActivityService) {}

  ngOnInit(): void {
    this.busy = this.singleClick.isBusy;
    this.sub = this.singleClick.busy$.subscribe((busy) => {
      this.busy = busy;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  @HostBinding('class.app-single-click-busy')
  get busyClass(): boolean {
    return this.busy;
  }

  @HostBinding('attr.aria-busy')
  get ariaBusy(): string | null {
    return this.busy ? 'true' : null;
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (!this.singleClick.isBusy) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
