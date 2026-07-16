import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Subscription, timer, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

export interface DeploymentBannerState {
  enabled: boolean;
  title: string;
  message: string;
  hint: string;
  leftImage: string;
  rightImage: string;
}

const DEFAULT_STATE: DeploymentBannerState = {
  enabled: false,
  title: "We're upgrading Kapunter",
  message:
    'A live system update is running. Deposits, withdrawals, and login may be temporarily unavailable.',
  hint: 'Please wait a few minutes, then refresh.',
  leftImage: 'assets/deployment-banner-hero.svg',
  rightImage: 'assets/deployment-banner-server.svg',
};

/** Relative asset checked on an interval. Set enabled:true on the server to show the banner. */
const BANNER_ASSET_URL = 'assets/deployment-banner.json';

/** While banner is ON — check often so it can clear after deploy. */
const POLL_WHEN_ENABLED_MS = 30_000;

/** While banner is OFF — check rarely (avoids noise / memory from constant polling). */
const POLL_WHEN_DISABLED_MS = 5 * 60_000;

/** After repeated failures (404 etc.), back off harder. */
const POLL_AFTER_ERROR_MS = 15 * 60_000;

@Injectable({ providedIn: 'root' })
export class DeploymentBannerService implements OnDestroy {
  private readonly stateSubject = new BehaviorSubject<DeploymentBannerState>({ ...DEFAULT_STATE });
  readonly state$ = this.stateSubject.asObservable();

  private pollSub?: Subscription;
  private consecutiveErrors = 0;
  private started = false;

  constructor(private http: HttpClient) {}

  /** Start adaptive polling. Safe to call once from AppComponent. */
  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.scheduleNext(0);
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.started = false;
  }

  private scheduleNext(delayMs: number): void {
    this.pollSub?.unsubscribe();
    this.pollSub = timer(delayMs)
      .pipe(switchMap(() => this.fetchBanner()))
      .subscribe((state) => {
        this.stateSubject.next(state);
        const nextDelay = this.nextPollDelay(state);
        this.scheduleNext(nextDelay);
      });
  }

  private nextPollDelay(state: DeploymentBannerState): number {
    if (this.consecutiveErrors > 0) {
      return POLL_AFTER_ERROR_MS;
    }
    return state.enabled ? POLL_WHEN_ENABLED_MS : POLL_WHEN_DISABLED_MS;
  }

  private fetchBanner() {
    // Cache-bust only when actively showing the banner (need fresh enabled:false soon).
    const bust = this.stateSubject.value.enabled ? `?t=${Date.now()}` : '';
    const url = `${BANNER_ASSET_URL}${bust}`;

    return this.http
      .get<{
        enabled?: boolean;
        title?: string;
        message?: string;
        hint?: string;
        leftImage?: string;
        rightImage?: string;
        image?: string;
      }>(url, {
        headers: this.stateSubject.value.enabled
          ? { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
          : undefined,
      })
      .pipe(
        tap(() => {
          this.consecutiveErrors = 0;
        }),
        map((body) => {
          const enabled = body?.enabled === true;
          return {
            enabled,
            title: String(body?.title || '').trim() || DEFAULT_STATE.title,
            message: String(body?.message || '').trim() || DEFAULT_STATE.message,
            hint: String(body?.hint || '').trim() || DEFAULT_STATE.hint,
            leftImage:
              String(body?.leftImage || body?.image || '').trim() || DEFAULT_STATE.leftImage,
            rightImage: String(body?.rightImage || '').trim() || DEFAULT_STATE.rightImage,
          } as DeploymentBannerState;
        }),
        catchError((err: unknown) => {
          this.consecutiveErrors += 1;
          // 404 / network: stay hidden; do not rethrow (keeps app calm).
          if (err instanceof HttpErrorResponse && err.status === 404) {
            // Missing file is expected until ops adds it — back off quietly.
          }
          return of({ ...DEFAULT_STATE, enabled: false });
        })
      );
  }
}
