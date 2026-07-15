import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subscription, timer, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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

/** Relative asset checked on an interval. Add this file on the server to show the banner. */
const BANNER_ASSET_URL = 'assets/deployment-banner.json';

/** How often to re-check so enabling/disabling mid-session works without a hard refresh. */
const POLL_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class DeploymentBannerService implements OnDestroy {
  private readonly stateSubject = new BehaviorSubject<DeploymentBannerState>({ ...DEFAULT_STATE });
  readonly state$ = this.stateSubject.asObservable();

  private pollSub?: Subscription;

  constructor(private http: HttpClient) {}

  /** Start polling. Safe to call once from AppComponent. */
  start(): void {
    if (this.pollSub) {
      return;
    }
    this.pollSub = timer(0, POLL_MS)
      .pipe(switchMap(() => this.fetchBanner()))
      .subscribe((state) => this.stateSubject.next(state));
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  private fetchBanner() {
    const url = `${BANNER_ASSET_URL}?t=${Date.now()}`;
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
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      .pipe(
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
        catchError(() => of({ ...DEFAULT_STATE, enabled: false }))
      );
  }
}
