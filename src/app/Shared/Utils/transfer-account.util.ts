import { IIDDetailsModal } from 'src/app/Shared/Modals/Ids/id_detail-modal';
import { TransferAccountOption } from 'src/app/Shared/Modals/Ids/transfer-id-request';

export function resolveAccountIdValue(row: Record<string, unknown> | IIDDetailsModal | null | undefined): number {
  if (!row) {
    return 0;
  }

  const value =
    (row as Record<string, unknown>)['accountId'] ??
    (row as Record<string, unknown>)['accountID'] ??
    (row as Record<string, unknown>)['AccountId'] ??
    (row as Record<string, unknown>)['AccountID'] ??
    0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapIdToTransferAccount(row: IIDDetailsModal): TransferAccountOption | null {
  const accountId = resolveAccountIdValue(row as unknown as Record<string, unknown>);
  if (accountId <= 0) {
    return null;
  }

  const userName = String(row.userName ?? '').trim();
  if (!userName) {
    return null;
  }

  const siteId = Number(
    (row as unknown as Record<string, unknown>)['siteId'] ??
      (row as unknown as Record<string, unknown>)['SiteId'] ??
      row.siteId ??
      0
  );

  return {
    key: `account-${accountId}`,
    accountId,
    siteId: Number.isFinite(siteId) ? siteId : 0,
    siteName: String(row.siteName ?? '').trim(),
    userName,
    userNumber: String(row.userNumber ?? '').trim(),
    documentDetailId: String(row.documentDetailId ?? '').trim(),
    fileExtenstion: String(row.fileExtenstion ?? '').trim(),
  };
}
