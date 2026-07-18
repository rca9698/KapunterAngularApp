import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { serializeForApi } from './Shared/Utils/api-serialize.util';
import { SUPPRESS_ERROR_TOAST } from './Shared/loader/loader.tokens';
import { AuthService } from './auth.service';
import { ToastrService } from './toastr/toastr.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  private handlingSessionExpiry = false;
  private lastErrorKey = '';
  private lastErrorAt = 0;

  constructor(private injector: Injector) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let updatedReq = req;

    if (
      req.body != null &&
      typeof req.body === 'object' &&
      !(req.body instanceof FormData)
    ) {
      updatedReq = req.clone({ body: serializeForApi(req.body) });
    }

    const authservice = this.injector.get(AuthService);
    const token = authservice.token;
    if (token) {
      updatedReq = updatedReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    const suppressErrorToast = req.context.get(SUPPRESS_ERROR_TOAST);

    return next.handle(updatedReq).pipe(
      tap((event) => {
        if (!(event instanceof HttpResponse) || suppressErrorToast) {
          return;
        }
        const body = event.body;
        const status = body?.returnStatus ?? body?.ReturnStatus;
        const message = String(body?.returnMessage ?? body?.ReturnMessage ?? '');
        if (status === 0) {
          this.showApiError(message);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          const reason = err.error?.reason ?? err.error?.Reason ?? '';
          const message =
            err.error?.returnMessage ??
            err.error?.ReturnMessage ??
            'Your session ended. Please log in again.';

          if (String(reason).toLowerCase() === 'sessionexpired' || String(message).toLowerCase().includes('another device')) {
            if (!this.handlingSessionExpiry && authservice.isLoggedIn) {
              this.handlingSessionExpiry = true;
              try {
                this.injector.get(ToastrService).warning(message);
              } catch { /* ignore */ }
              setTimeout(() => authservice.logout(), 400);
            }
          }
        }
        if (!suppressErrorToast && (err.status !== 401 || !this.handlingSessionExpiry)) {
          const serverMessage =
            err.error?.returnMessage ??
            err.error?.ReturnMessage ??
            err.error?.message ??
            err.error?.Message ??
            '';
          this.showApiError(String(serverMessage), err.status);
        }
        return throwError(() => err);
      })
    );
  }

  private showApiError(serverMessage: string, status?: number): void {
    const traceId = serverMessage.match(/traceid[=:]\s*([a-z0-9-]+)/i)?.[1];
    const key = `${status ?? 'api'}:${traceId || serverMessage || 'unknown'}`;
    const now = Date.now();
    if (this.lastErrorKey === key && now - this.lastErrorAt < 5000) {
      return;
    }
    this.lastErrorKey = key;
    this.lastErrorAt = now;

    const message = status === 0
      ? 'We cannot reach the service right now. Check your connection and try again.'
      : `We couldn't complete your request. Please try again.${traceId ? ` Reference: ${traceId}` : ''}`;

    try {
      this.injector.get(ToastrService).error(message, 'Request failed');
    } catch {
      /* The error must continue to the original caller even if UI notification fails. */
    }
  }
}

export const AuthInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptorService,
  multi: true
};
