/** Normalizes API field casing for ID / account request rows. */
export function resolveAccountRequestId(row: Record<string, unknown> | null | undefined): string {
  const value =
    row?.['accountRequestId'] ??
    row?.['accountRequestID'] ??
    row?.['AccountRequestID'] ??
    '';
  return String(value);
}

export function resolveAccountId(row: Record<string, unknown> | null | undefined): string {
  const value = row?.['accountId'] ?? row?.['accountID'] ?? row?.['AccountId'] ?? '';
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized === '0' || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
    return '';
  }
  return normalized;
}

export function resolveSiteLabel(row: Record<string, unknown> | null | undefined): string {
  const siteName = row?.['siteName'] ?? row?.['SiteName'];
  const siteUrl = row?.['siteURL'] ?? row?.['SiteURL'];
  return String(siteName || siteUrl || '—');
}
