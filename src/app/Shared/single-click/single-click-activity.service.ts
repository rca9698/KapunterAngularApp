import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Product-level guard against duplicate activity mutations (double-clicks).
 * Used by SingleClickActivityInterceptor and optional [appSingleClick] UI bindings.
 */
@Injectable({
  providedIn: 'root',
})
export class SingleClickActivityService {
  /** Keep identical mutations locked briefly after completion to catch rapid re-clicks. */
  readonly cooldownMs = 1500;

  /** Infinity = in-flight; finite = cooldown expiry timestamp. */
  private readonly locks = new Map<string, number>();
  private readonly busySubject = new BehaviorSubject<boolean>(false);

  readonly busy$ = this.busySubject.asObservable();

  /** True while at least one activity mutation HTTP call is in flight (not cooldown). */
  get isBusy(): boolean {
    return this.busySubject.value;
  }

  isLocked(key: string): boolean {
    this.pruneExpired();
    return this.locks.has(key);
  }

  /** Returns false when the same activity is already in flight or in cooldown. */
  tryAcquire(key: string): boolean {
    this.pruneExpired();
    if (this.locks.has(key)) {
      return false;
    }
    this.locks.set(key, Number.POSITIVE_INFINITY);
    this.busySubject.next(true);
    return true;
  }

  release(key: string, applyCooldown = true): void {
    if (!this.locks.has(key)) {
      this.syncBusy();
      return;
    }

    if (!applyCooldown || this.cooldownMs <= 0) {
      this.locks.delete(key);
      this.syncBusy();
      return;
    }

    this.locks.set(key, Date.now() + this.cooldownMs);
    this.syncBusy();
  }

  private pruneExpired(): void {
    const now = Date.now();
    let changed = false;
    for (const [key, until] of this.locks) {
      if (Number.isFinite(until) && until <= now) {
        this.locks.delete(key);
        changed = true;
      }
    }
    if (changed) {
      this.syncBusy();
    }
  }

  private syncBusy(): void {
    let inFlight = false;
    for (const until of this.locks.values()) {
      if (!Number.isFinite(until)) {
        inFlight = true;
        break;
      }
    }
    if (this.busySubject.value !== inFlight) {
      this.busySubject.next(inFlight);
    }
  }
}
