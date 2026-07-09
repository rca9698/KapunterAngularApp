import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LOADER_MESSAGE, SKIP_GLOBAL_LOADER } from './loader.tokens';
import { LoaderService } from './loader.service';

const SILENT_API_PATHS = [
  '/api/Home/GetVisitorStats',
  '/api/User/GetUserById',
  '/api/Home/GetDashboardImages',
];

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.shouldTrack(req)) {
      return next.handle(req);
    }

    const message = req.context.get(LOADER_MESSAGE);
    this.loaderService.httpRequestStarted(message);

    return next.handle(req).pipe(
      finalize(() => {
        this.loaderService.httpRequestEnded();
      })
    );
  }

  private shouldTrack(req: HttpRequest<unknown>): boolean {
    if (req.context.get(SKIP_GLOBAL_LOADER)) {
      return false;
    }

    const url = req.url.toLowerCase();
    if (!url.includes(environment.apiUrl.toLowerCase())) {
      return false;
    }

    return !SILENT_API_PATHS.some((path) => url.includes(path.toLowerCase()));
  }
}

export const LoaderInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: LoaderInterceptor,
  multi: true,
};
