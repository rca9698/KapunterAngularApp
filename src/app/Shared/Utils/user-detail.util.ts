import { Iusers, users } from '../Modals/users';

/** Coerce API user payload (any casing) into a non-null Iusers instance. */
export function normalizeUserDetail(raw: unknown): Iusers {
  if (!raw || typeof raw !== 'object') {
    return new users();
  }

  const row = raw as Record<string, unknown>;
  const pick = (...keys: string[]): unknown => {
    for (const key of keys) {
      const value = row[key];
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }
    return undefined;
  };

  const password = String(pick('password', 'Password') ?? '');
  const hasPasswordRaw = pick('hasPassword', 'HasPassword');
  const hasPassword =
    hasPasswordRaw === true ||
    hasPasswordRaw === 1 ||
    hasPasswordRaw === '1' ||
    hasPasswordRaw === 'true' ||
    (!!password && password.trim().length > 0);

  const detail = new users(
    (pick('userId', 'UserId') ?? 0) as bigint,
    String(pick('firstName', 'FirstName') ?? ''),
    String(pick('lastName', 'LastName') ?? ''),
    String(pick('userNumber', 'UserNumber') ?? ''),
    String(pick('emailId', 'EmailId') ?? ''),
    String(pick('claims', 'Claims') ?? ''),
    String(pick('coins', 'Coins') ?? ''),
    '', // never keep password in client state
    String(pick('otp', 'OTP', 'Otp') ?? ''),
    (pick('sessionUser', 'SessionUser') ?? 0) as bigint,
    String(pick('createdBy', 'CreatedBy') ?? ''),
    String(pick('createdDate', 'CreatedDate') ?? ''),
    String(pick('updatedBy', 'UpdatedBy') ?? ''),
    String(pick('updatedDate', 'UpdatedDate') ?? ''),
    String(pick('themePreference', 'ThemePreference') ?? 'dark'),
    Number(pick('totalCount', 'TotalCount') ?? 0),
    Number(pick('paginationCount', 'PaginationCount') ?? 0),
    hasPassword
  );

  return detail;
}

/** Safe wallet balance for templates — never throws on null/undefined detail. */
export function resolveWalletBalance(detail: Iusers | null | undefined): string | number {
  if (!detail) {
    return 0;
  }

  const coins = detail.coins;
  if (coins === null || coins === undefined || String(coins).trim() === '') {
    return 0;
  }

  return coins;
}
