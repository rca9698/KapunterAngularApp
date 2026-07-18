import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';
import { apiService } from './api.service';
import { VisitorStats } from './Shared/Modals/visitor-stats';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisitorCountService {
  private readonly _stats = new BehaviorSubject<VisitorStats>({
    totalVisits: 0,
    todayVisits: 0,
    weekVisits: 0,
    activeSessions: 0
  });

  readonly stats$ = this._stats.asObservable();
  loading = false;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private loginRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  /** True while the activity snapshot poll supplies stats — own polling paused. */
  private externalFeedActive = false;

  constructor(private apiservice: apiService) {}

  get snapshot(): VisitorStats {
    return this._stats.value;
  }

  loadStats(silent = false, recentCount = 0): void {
    if (this.externalFeedActive) {
      return;
    }

    if (!silent) {
      this.loading = true;
    }

    this.apiservice.GetVisitorStats(recentCount).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (response) => {
        const parsed = this.parseResponse(response);
        if (parsed) {
          this._stats.next(parsed);
          return;
        }

        if (!environment.production) {
          console.warn('[VisitorCount] Unrecognized API response:', response);
        }
      },
      error: (err) => {
        if (!environment.production) {
          console.warn('[VisitorCount] API request failed:', err);
        }
      }
    });
  }

  /** Refresh shortly after login so DB write completes before read. */
  refreshAfterLogin(): void {
    if (this.loginRefreshTimer) {
      clearTimeout(this.loginRefreshTimer);
    }
    this.loginRefreshTimer = setTimeout(() => {
      if (!this.externalFeedActive) {
        this.loadStats(true, 0);
      }
      this.loginRefreshTimer = null;
    }, 400);
  }

  /**
   * Navbar counter: light payload (no recent logins) on a slow interval.
   * Default 3 minutes — near-real-time without hammering the API.
   */
  startAutoRefresh(intervalMs = 180000): void {
    if (this.externalFeedActive) {
      return;
    }
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => this.loadStats(true, 0), intervalMs);
  }

  /**
   * The consolidated activity snapshot already includes visitor stats.
   * While it polls, stop hitting GetVisitorStats separately.
   */
  setExternalFeedActive(active: boolean): void {
    this.externalFeedActive = active;
    if (active) {
      this.stopAutoRefresh();
    }
  }

  /** Push stats delivered by the activity snapshot poll. */
  applyExternalStats(raw: any): void {
    if (!raw) {
      return;
    }
    if (this.hasStatsShape(raw)) {
      this._stats.next(this.mapStats(raw));
    }
  }

  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private parseResponse(response: any): VisitorStats | null {
    if (!response) {
      return null;
    }

    const status = response.returnStatus ?? response.ReturnStatus;
    const val = response.returnVal ?? response.ReturnVal;
    const list = response.returnList ?? response.ReturnList;

    // Explicit API failure / empty — keep zeros, don't treat as "unrecognized"
    if (status === 0 || status === '0' || status === 'Failure') {
      return { totalVisits: 0, todayVisits: 0, weekVisits: 0, activeSessions: 0, recentLogins: [] };
    }

    if (val && this.hasStatsShape(val)) {
      return this.mapStats(val);
    }

    if (response && this.hasStatsShape(response)) {
      return this.mapStats(response);
    }

    if (Array.isArray(list) && list.length === 0 && val == null) {
      return { totalVisits: 0, todayVisits: 0, weekVisits: 0, activeSessions: 0, recentLogins: [] };
    }

    const statusOk = status === 1 || status === '1' || status === 'Success' || status === 'success';
    if (statusOk && val) {
      return this.mapStats(val);
    }

    if (statusOk && (val == null || list == null)) {
      return { totalVisits: 0, todayVisits: 0, weekVisits: 0, activeSessions: 0, recentLogins: [] };
    }

    return null;
  }

  private hasStatsShape(obj: any): boolean {
    return (
      obj.totalVisits != null ||
      obj.TotalVisits != null ||
      obj.todayVisits != null ||
      obj.TodayVisits != null ||
      obj.activeSessions != null ||
      obj.ActiveSessions != null
    );
  }

  private mapStats(val: any): VisitorStats {
    return {
      totalVisits: Number(val.totalVisits ?? val.TotalVisits ?? 0),
      todayVisits: Number(val.todayVisits ?? val.TodayVisits ?? 0),
      weekVisits: Number(val.weekVisits ?? val.WeekVisits ?? 0),
      activeSessions: Number(val.activeSessions ?? val.ActiveSessions ?? 0),
      lastUpdated: val.lastUpdated ?? val.LastUpdated,
      recentLogins: val.recentLogins ?? val.RecentLogins ?? []
    };
  }
}
