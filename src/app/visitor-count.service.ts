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
    weekVisits: 0
  });

  readonly stats$ = this._stats.asObservable();
  loading = false;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private loginRefreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private apiservice: apiService) {}

  get snapshot(): VisitorStats {
    return this._stats.value;
  }

  loadStats(silent = false): void {
    if (!silent) {
      this.loading = true;
    }

    this.apiservice.GetVisitorStats().pipe(
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
      this.loadStats(true);
      this.loginRefreshTimer = null;
    }, 400);
  }

  startAutoRefresh(intervalMs = 30000): void {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => this.loadStats(true), intervalMs);
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

    const val = response.returnVal ?? response.ReturnVal;
    const list = response.returnList ?? response.ReturnList;

    if (val && this.hasStatsShape(val)) {
      return this.mapStats(val);
    }

    if (response && this.hasStatsShape(response)) {
      return this.mapStats(response);
    }

    if (Array.isArray(list) && list.length === 0 && val == null) {
      return { totalVisits: 0, todayVisits: 0, weekVisits: 0, recentLogins: [] };
    }

    const status = response.returnStatus ?? response.ReturnStatus;
    const statusOk = status === 1 || status === '1' || status === 'Success' || status === 'success';
    if (statusOk && val) {
      return this.mapStats(val);
    }

    return null;
  }

  private hasStatsShape(obj: any): boolean {
    return (
      obj.totalVisits != null ||
      obj.TotalVisits != null ||
      obj.todayVisits != null ||
      obj.TodayVisits != null
    );
  }

  private mapStats(val: any): VisitorStats {
    return {
      totalVisits: Number(val.totalVisits ?? val.TotalVisits ?? 0),
      todayVisits: Number(val.todayVisits ?? val.TodayVisits ?? 0),
      weekVisits: Number(val.weekVisits ?? val.WeekVisits ?? 0),
      lastUpdated: val.lastUpdated ?? val.LastUpdated,
      recentLogins: val.recentLogins ?? val.RecentLogins ?? []
    };
  }
}
