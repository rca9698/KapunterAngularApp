import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { Ipassbook_detail_model } from 'src/app/Shared/Modals/passbook_detail_model';

export interface PassbookAccountFilter {
  userName?: string;
  userNumber?: string | number | bigint;
  accountId?: string | number | bigint;
}

export function resolvePassbookSiteUserName(txn: Ipassbook_detail_model): string {
  return String(txn.siteUserName ?? txn.userName ?? '').trim();
}

export function filterPassbooksForSiteAccount(
  passbooks: Ipassbook_detail_model[],
  account: PassbookAccountFilter
): Ipassbook_detail_model[] {
  const siteUser = String(account.userName ?? '').trim().toLowerCase();
  const siteNumber = String(account.userNumber ?? '').trim();

  if (!siteUser && !siteNumber) {
    return passbooks;
  }

  return passbooks.filter((txn) => {
    const txnUser = resolvePassbookSiteUserName(txn).toLowerCase();
    if (siteUser && txnUser && txnUser === siteUser) {
      return true;
    }

    const txnNumber = String((txn as unknown as Record<string, unknown>)['userNumber'] ?? '').trim();
    if (siteNumber && txnNumber && txnNumber === siteNumber) {
      return true;
    }

    return false;
  });
}

export function passbookFilterFromSite(site: ISiteDetailModal): PassbookAccountFilter {
  return {
    userName: site.userName,
    userNumber: site.userNumber,
    accountId: site.accountId,
  };
}
