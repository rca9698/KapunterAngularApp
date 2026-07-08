/** Normalizes API field casing (C# PascalCase / mixed ID suffixes). */
export function resolveAccountId(row: Record<string, unknown> | null | undefined): bigint {
  const value = row?.['accountId'] ?? row?.['accountID'] ?? row?.['AccountID'] ?? 0;
  return BigInt(value as string | number | bigint);
}

export function resolveBankId(row: Record<string, unknown> | null | undefined): bigint {
  const value =
    row?.['bankId'] ??
    row?.['BankId'] ??
    row?.['bankDetailId'] ??
    row?.['BankDetailId'] ??
    0;
  return BigInt(value as string | number | bigint);
}

export function resolveCoinRequestId(row: Record<string, unknown> | null | undefined): string {
  return String(row?.['coinsRequestId'] ?? row?.['CoinsRequestId'] ?? '');
}

export function hasBankId(row: Record<string, unknown> | null | undefined): boolean {
  return resolveBankId(row) > 0n;
}
