import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private readonly showDelayMs = 180;
  private readonly minVisibleMs = 320;

  private httpRequestCount = 0;
  private manualCount = 0;
  private routeLoading = false;

  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private visibleSince = 0;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly messageSubject = new BehaviorSubject<string>('Loading…');

  readonly loading$ = this.loadingSubject.asObservable();
  readonly message$ = this.messageSubject.asObservable();

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get message(): string {
    return this.messageSubject.value;
  }

  httpRequestStarted(message?: string | null): void {
    this.httpRequestCount++;
    if (message) {
      this.messageSubject.next(message);
    }
    this.scheduleShow();
  }

  httpRequestEnded(): void {
    this.httpRequestCount = Math.max(0, this.httpRequestCount - 1);
    if (this.httpRequestCount === 0) {
      this.scheduleHide();
    }
  }

  show(message = 'Loading…'): void {
    this.manualCount++;
    this.messageSubject.next(message);
    this.scheduleShow();
  }

  hide(): void {
    this.manualCount = Math.max(0, this.manualCount - 1);
    if (this.manualCount === 0 && this.httpRequestCount === 0 && !this.routeLoading) {
      this.scheduleHide();
    }
  }

  setRouteLoading(active: boolean, message = 'Loading page…'): void {
    this.routeLoading = active;
    if (active) {
      this.messageSubject.next(message);
      this.scheduleShow();
      return;
    }

    if (this.httpRequestCount === 0 && this.manualCount === 0) {
      this.scheduleHide();
    }
  }

  private shouldBeVisible(): boolean {
    return this.httpRequestCount > 0 || this.manualCount > 0 || this.routeLoading;
  }

  private scheduleShow(): void {
    if (!this.shouldBeVisible()) {
      return;
    }

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (this.loadingSubject.value || this.showTimer) {
      return;
    }

    this.showTimer = setTimeout(() => {
      this.showTimer = null;
      if (!this.shouldBeVisible()) {
        return;
      }
      this.visibleSince = Date.now();
      this.loadingSubject.next(true);
    }, this.showDelayMs);
  }

  private scheduleHide(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (!this.loadingSubject.value) {
      return;
    }

    const elapsed = Date.now() - this.visibleSince;
    const wait = Math.max(0, this.minVisibleMs - elapsed);

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }

    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      if (this.shouldBeVisible()) {
        return;
      }
      this.loadingSubject.next(false);
      this.messageSubject.next('Loading…');
    }, wait);
  }
}
