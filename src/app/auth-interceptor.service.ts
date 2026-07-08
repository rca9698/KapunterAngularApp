import { HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serializeForApi } from './Shared/Utils/api-serialize.util';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private authservice: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let updatedReq = req;

    if (
      req.body != null &&
      typeof req.body === 'object' &&
      !(req.body instanceof FormData)
    ) {
      updatedReq = req.clone({ body: serializeForApi(req.body) });
    }

    const token = this.authservice.token;
    if (token) {
      updatedReq = updatedReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(updatedReq);
  }
}

export const AuthInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptorService,
  multi: true
}
