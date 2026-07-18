import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, interval, of } from 'rxjs';
import { catchError, filter, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { apiService } from 'src/app/api.service';
import { VisitorCountService } from 'src/app/visitor-count.service';

/** Parsed payload of /api/Home/GetUserActivitySnapshot (one SP round trip). */
export interface ActivitySnapshot {
  visitorStats: any | null;
  /** Pending create-ID requests for the user. */
  pendingIdRequests: any[];
  /** Rejected create-ID requests for the user. */
  rejectedIdRequests: any[];
  /** Active site coin requests — coinType 1 = deposit, 0 = withdraw. */
  siteCoinRequests: any[];
  /** Active wallet withdraw requests. */
  walletWithdrawRequests: any[];
  /** Pending close-ID requests for the user. */
  closeIdRequests: any[];
  /** Recent passbook history rows for the user. */
  passbookHistory: any[];
}

/**
 * Single shared poller for everything the beneficiary UI used to fetch with
 * 7 separate calls every cycle (IDRequestList, RejectedRequestList,
 * GetCoinsToAccountRequest x2, GetCoinsRequest, ListIDCloseRequest,
 * GetPassbookHistory + GetVisitorStats). One request every 45s, results are
 * fanned out to RequestTrackerService, PassbookUnreadService and
 * VisitorCountService. Polling pauses while the browser tab is hidden, and
 * the more expensive global visitor counts are refreshed only every 3 minutes.
 */
@Injectable({ providedIn: 'root' })
export class ActivitySnapshotService implements OnDestroy {
  private readonly pollMs = 45000;
  private readonly visitorStatsRefreshMs = 180000;

  private readonly snapshotSubject = new BehaviorSubject<ActivitySnapshot | null>(null);
  readonly snapshot$ = this.snapshotSubject.asObservable();

  private authSub?: Subscription;
  private pollSub?: Subscription;
  private startedForUser: string | null = null;
  private inFlight = false;
  private lastVisitorStatsAt = 0;
  private readonly onVisibilityChange = () => {
    if (document.visibilityState === 'visible' && this.startedForUser) {
      this.fetchOnce();
    }
  };

  constructor(
    private auth: AuthService,
    private api: apiService,
    private visitorCount: VisitorCountService
  ) {
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.authSub = this.auth.isLoggenIn.subscribe((loggedIn) => {
      if (loggedIn && this.auth.isbenview()) {
        this.start();
      } else {
        this.stop();
      }
    });

    if (this.auth.isLoggedIn && this.auth.isbenview()) {
      this.start();
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.authSub?.unsubscribe();
    this.stop();
  }

  get snapshot(): ActivitySnapshot | null {
    return this.snapshotSubject.value;
  }

  /** Immediate re-poll — call after submitting a request or opening a panel. */
  refreshNow(): void {
    if (!this.auth.isLoggedIn || !this.auth.isbenview()) {
      return;
    }
    this.fetchOnce();
  }

  private start(): void {
    const userKey = String(this.auth.user?.userId ?? '');
    if (!userKey || userKey === '0') {
      return;
    }
    if (this.startedForUser === userKey && this.pollSub) {
      return;
    }

    this.stop();
    this.startedForUser = userKey;
    // Snapshot already carries visitor stats — pause the separate stats poll.
    this.visitorCount.setExternalFeedActive(true);
    this.fetchOnce();

    this.pollSub = interval(this.pollMs)
      .pipe(filter(() =>
        document.visibilityState === 'visible'
        && this.auth.isLoggedIn
        && this.auth.isbenview()
      ))
      .subscribe(() => this.fetchOnce());
  }

  private stop(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
    if (this.startedForUser !== null) {
      this.visitorCount.setExternalFeedActive(false);
    }
    this.startedForUser = null;
    this.inFlight = false;
    this.lastVisitorStatsAt = 0;
    this.snapshotSubject.next(null);
  }

  private fetchOnce(): void {
    if (this.inFlight) {
      return;
    }
    this.inFlight = true;
    const includeVisitorStats =
      this.lastVisitorStatsAt === 0
      || Date.now() - this.lastVisitorStatsAt >= this.visitorStatsRefreshMs;

    this.api.GetUserActivitySnapshot(includeVisitorStats)
      .pipe(
        take(1),
        catchError(() => of(null))
      )
      .subscribe((resp: any) => {
        this.inFlight = false;
        if (!resp) {
          return;
        }
        const status = resp.returnStatus ?? resp.ReturnStatus;
        if (status != null && status !== 1) {
          return;
        }

        const val = resp.returnVal ?? resp.ReturnVal ?? {};
        const snapshot: ActivitySnapshot = {
          visitorStats: val.visitorStats ?? val.VisitorStats ?? null,
          pendingIdRequests: this.asArray(val.pendingIdRequests ?? val.PendingIdRequests),
          rejectedIdRequests: this.asArray(val.rejectedIdRequests ?? val.RejectedIdRequests),
          siteCoinRequests: this.asArray(val.siteCoinRequests ?? val.SiteCoinRequests),
          walletWithdrawRequests: this.asArray(val.walletWithdrawRequests ?? val.WalletWithdrawRequests),
          closeIdRequests: this.asArray(val.closeIdRequests ?? val.CloseIdRequests),
          passbookHistory: this.asArray(val.passbookHistory ?? val.PassbookHistory),
        };

        if (snapshot.visitorStats) {
          this.lastVisitorStatsAt = Date.now();
          this.visitorCount.applyExternalStats(snapshot.visitorStats);
        }
        this.snapshotSubject.next(snapshot);
      });
  }

  private asArray(value: unknown): any[] {
    return Array.isArray(value) ? value : [];
  }
}
