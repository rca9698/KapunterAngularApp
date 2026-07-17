import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SingleClickActivityService } from './single-click-activity.service';
import { SKIP_SINGLE_CLICK_ACTIVITY } from './single-click-activity.tokens';
import { activityRequestKey, isActivityMutationRequest } from './single-click-activity.util';

/**
 * Product-level single-click protection: identical in-flight (or cooldown) activity
 * mutations are dropped so double-clicks cannot insert duplicate passbook/coin rows.
 */
@Injectable()
export class SingleClickActivityInterceptor implements HttpInterceptor {
  constructor(private singleClick: SingleClickActivityService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.shouldGuard(req)) {
      return next.handle(req);
    }

    const key = activityRequestKey(req);
    if (!this.singleClick.tryAcquire(key)) {
      // Silent drop — avoids a second API insert and skips duplicate success/error toasts.
      return EMPTY;
    }

    return next.handle(req).pipe(
      finalize(() => {
        this.singleClick.release(key, true);
      })
    );
  }

  private shouldGuard(req: HttpRequest<unknown>): boolean {
    if (req.context.get(SKIP_SINGLE_CLICK_ACTIVITY)) {
      return false;
    }

    const url = req.url.toLowerCase();
    if (!url.includes(environment.apiUrl.toLowerCase())) {
      return false;
    }

    return isActivityMutationRequest(req);
  }
}

export const SingleClickActivityInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: SingleClickActivityInterceptor,
  multi: true,
};
