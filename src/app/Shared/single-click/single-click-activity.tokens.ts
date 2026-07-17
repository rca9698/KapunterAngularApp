import { HttpContextToken } from '@angular/common/http';

/** Opt out of product-level single-click mutation protection for a specific request. */
export const SKIP_SINGLE_CLICK_ACTIVITY = new HttpContextToken<boolean>(() => false);
