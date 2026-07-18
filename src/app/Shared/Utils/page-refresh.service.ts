import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Refreshes the current route's components in place.
 *
 * Replaces window.location.reload() after mutations: a full reload restarts the
 * entire WebView inside the Android app (splash screen, back to home), which
 * users experience as the app "closing" or crashing. Re-navigating to the same
 * URL with route reuse disabled re-runs ngOnInit (so lists reload) without
 * restarting the app shell.
 */
@Injectable({ providedIn: 'root' })
export class PageRefreshService {
  constructor(private router: Router) {}

  refreshCurrentRoute(): void {
    const url = this.router.url || '/';
    const previousShouldReuse = this.router.routeReuseStrategy.shouldReuseRoute;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    this.router
      .navigateByUrl(url, { onSameUrlNavigation: 'reload' })
      .catch(() => {
        // Never leave the user stuck; fall back to a hard reload.
        window.location.reload();
      })
      .finally(() => {
        this.router.routeReuseStrategy.shouldReuseRoute = previousShouldReuse;
      });
  }
}
