import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isNativeApp } from './platform.util';

declare global {
  interface Window {
    /** Original browser fetch saved by Capacitor before CapacitorHttp patches window.fetch. */
    CapacitorWebFetch?: typeof fetch;
  }
}

/**
 * CapacitorHttp's native bridge cannot reliably rebuild multipart FormData
 * (missing Content-Type boundary → empty body → API "No file provided").
 * On native, send FormData through the original WebView fetch instead.
 */
@Injectable()
export class NativeFormDataInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!(req.body instanceof FormData) || !isNativeApp()) {
      return next.handle(req);
    }

    return from(this.sendWithWebFetch(req)).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  private async sendWithWebFetch(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    const webFetch = window.CapacitorWebFetch ?? window.fetch.bind(window);
    const headers: Record<string, string> = {};

    req.headers.keys().forEach((key) => {
      if (key.toLowerCase() === 'content-type') {
        return;
      }
      const value = req.headers.get(key);
      if (value != null) {
        headers[key] = value;
      }
    });

    let response: Response;
    try {
      response = await webFetch(req.urlWithParams, {
        method: req.method,
        headers,
        body: req.body as FormData,
        credentials: req.withCredentials ? 'include' : 'same-origin',
      });
    } catch (networkError: unknown) {
      throw new HttpErrorResponse({
        error: networkError,
        status: 0,
        statusText: 'Unknown Error',
        url: req.urlWithParams,
      });
    }

    const contentType = response.headers.get('Content-Type') || '';
    let body: unknown = null;
    if (response.status !== 204) {
      try {
        if (contentType.includes('application/json')) {
          body = await response.json();
        } else {
          body = await response.text();
        }
      } catch {
        body = null;
      }
    }

    const httpHeaders = this.toHttpHeaders(response.headers);

    if (!response.ok) {
      throw new HttpErrorResponse({
        error: body,
        headers: httpHeaders,
        status: response.status,
        statusText: response.statusText,
        url: response.url || req.urlWithParams,
      });
    }

    return new HttpResponse({
      body,
      headers: httpHeaders,
      status: response.status,
      statusText: response.statusText,
      url: response.url || req.urlWithParams,
    });
  }

  private toHttpHeaders(headers: Headers): HttpHeaders {
    let result = new HttpHeaders();
    headers.forEach((value, key) => {
      result = result.append(key, value);
    });
    return result;
  }
}

export const NativeFormDataInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: NativeFormDataInterceptor,
  multi: true,
};
