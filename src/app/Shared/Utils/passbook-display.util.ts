import { Ipassbook_detail_model } from '../Modals/passbook_detail_model';

/** Activities that appear in passbook but do not move wallet coins. */
const NON_MONETARY_PATTERNS = [
  /create\s*id/i,
  /new\s*id/i,
  /id\s*request/i,
  /id\s*created/i,
  /account\s*created/i,
  /account\s*request/i,
  /open\s*id/i,
];

export function isNonMonetaryPassbookActivity(
  item: Pick<Ipassbook_detail_model, 'activityDescription' | 'trxStatus' | 'activityId'> | null | undefined
): boolean {
  if (!item) {
    return false;
  }
  const text = `${item.activityDescription || ''} ${item.trxStatus || ''}`.trim();
  if (!text) {
    return false;
  }
  return NON_MONETARY_PATTERNS.some((re) => re.test(text));
}

export function formatPassbookAmount(
  item: Pick<Ipassbook_detail_model, 'displayCoins' | 'coins' | 'activityDescription' | 'trxStatus' | 'activityId'> | null | undefined
): string | null {
  if (!item || isNonMonetaryPassbookActivity(item)) {
    return null;
  }
  const display = String(item.displayCoins ?? '').trim();
  if (display && display !== '0' && display !== '₹0' && display !== '₹ 0') {
    return display;
  }
  if (item.coins != null && Number(item.coins) !== 0) {
    return String(item.coins);
  }
  if (display) {
    return display;
  }
  return null;
}

export function passbookActivityKind(
  item: Pick<Ipassbook_detail_model, 'activityDescription' | 'trxStatus'> | null | undefined
): 'deposit' | 'withdraw' | 'create' | 'close' | 'transfer' | 'info' {
  const text = `${item?.trxStatus || ''} ${item?.activityDescription || ''}`.toLowerCase();
  if (text.includes('deposit') || text.includes('deposite')) return 'deposit';
  if (text.includes('withdraw')) return 'withdraw';
  if (text.includes('transfer')) return 'transfer';
  if (text.includes('create') || text.includes('new id')) return 'create';
  if (text.includes('close') || text.includes('remove')) return 'close';
  return 'info';
}
