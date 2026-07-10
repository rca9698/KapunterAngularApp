import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { serializeForApi } from './Shared/Utils/api-serialize.util';
import { AuthService } from './auth.service';
import { ToastrService } from './toastr/toastr.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  private handlingSessionExpiry = false;

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

    return next.handle(updatedReq).pipe(
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
        return throwError(() => err);
      })
    );
  }
}

export const AuthInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptorService,
  multi: true
};
