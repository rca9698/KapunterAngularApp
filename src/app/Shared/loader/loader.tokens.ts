import { HttpContextToken } from '@angular/common/http';

/** Set on HttpRequest context to avoid showing the global overlay loader. */
export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

export const LOADER_MESSAGE = new HttpContextToken<string | null>(() => null);
