import { ErrorHandler, Injectable, Provider } from '@angular/core';
import { ClientLoggerService } from './client-logger.service';

/**
 * Catches every unhandled exception in the app (including inside the Capacitor
 * Android WebView), records it locally and reports it to the API so crashes —
 * e.g. after OTP submit — leave a trace instead of silently killing the app.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private clientLogger: ClientLoggerService) {
    this.attachWindowHooks();
  }

  handleError(error: unknown): void {
    // Angular wraps promise rejections; unwrap for a useful message/stack.
    const unwrapped =
      error && typeof error === 'object' && 'rejection' in (error as Record<string, unknown>)
        ? (error as Record<string, unknown>)['rejection']
        : error;

    this.clientLogger.logError(unwrapped, 'angular-error-handler');

    // Keep default console output for local debugging.
    console.error(error);
  }

  private attachWindowHooks(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('error', (event: ErrorEvent) => {
      // Resource load errors have no error object; skip those.
      if (event?.error) {
        this.clientLogger.logError(event.error, 'window.onerror');
      }
    });

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.clientLogger.logError(event?.reason ?? 'Unhandled promise rejection', 'unhandledrejection');
    });
  }
}

export const GlobalErrorHandlerProvider: Provider = {
  provide: ErrorHandler,
  useClass: GlobalErrorHandler,
};
