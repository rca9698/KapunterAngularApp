import { HttpContextToken } from '@angular/common/http';

/** Set on HttpRequest context to avoid showing the global overlay loader. */
export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

export const LOADER_MESSAGE = new HttpContextToken<string | null>(() => null);

/**
 * Set on background/polling requests so a failure never surfaces the global
 * "Request failed" toast — callers handle (or intentionally ignore) errors.
 */
export const SUPPRESS_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
