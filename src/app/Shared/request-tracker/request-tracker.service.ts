import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, forkJoin, interval, of } from 'rxjs';
import { catchError, filter, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { apiService } from 'src/app/api.service';
import { PassbookActivityToastService } from 'src/app/Shared/passbook-activity-toast/passbook-activity-toast.service';
import { TrackedRequest, TrackedRequestKind } from './request-tracker.models';

@Injectable({ providedIn: 'root' })
export class RequestTrackerService implements OnDestroy {
  private readonly storagePrefix = 'kp_request_track_';
  private readonly pollMs = 20000;
  private readonly resolvedKeepMs = 36 * 60 * 60 * 1000;

  private readonly itemsSubject = new BehaviorSubject<TrackedRequest[]>([]);
  private readonly panelOpenSubject = new BehaviorSubject<boolean>(false);

  readonly items$ = this.itemsSubject.asObservable();
  readonly panelOpen$ = this.panelOpenSubject.asObservable();

  private authSub?: Subscription;
  private pollSub?: Subscription;
  private startedForUser: string | null = null;
  private previousPendingKeys = new Set<string>();
  private resolved: TrackedRequest[] = [];
  private baselineReady = false;

  constructor(
    private auth: AuthService,
    private api: apiService,
    private toast: PassbookActivityToastService
  ) {
    this.authSub = this.auth.isLoggenIn.subscribe((loggedIn) => {
      if (loggedIn && this.auth.isbenview()) {
        this.startForCurrentUser();
      } else {
        this.stop();
      }
    });

    if (this.auth.isLoggedIn && this.auth.isbenview()) {
      this.startForCurrentUser();
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.stop();
  }

  get pendingCount(): number {
    return this.itemsSubject.value.filter((x) => x.status === 'pending').length;
  }

  get items(): TrackedRequest[] {
    return this.itemsSubject.value;
  }

  openPanel(): void {
    this.panelOpenSubject.next(true);
    this.refresh();
  }

  closePanel(): void {
    this.panelOpenSubject.next(false);
  }

  togglePanel(): void {
    if (this.panelOpenSubject.value) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  refresh(): void {
    if (!this.auth.isLoggedIn || !this.auth.isbenview()) {
      return;
    }
    this.fetchOnce();
  }

  dismissResolved(key: string): void {
    this.resolved = this.resolved.filter((x) => x.key !== key);
    this.persist();
    this.publish(this.itemsSubject.value.filter((x) => x.status === 'pending'));
  }

  private startForCurrentUser(): void {
    const userKey = String(this.auth.user?.userId ?? '');
    if (!userKey || userKey === '0') {
      return;
    }
    if (this.startedForUser === userKey && this.pollSub) {
      return;
    }

    this.stop();
    this.startedForUser = userKey;
    this.loadPersisted(userKey);
    this.fetchOnce();

    this.pollSub = interval(this.pollMs)
      .pipe(filter(() => this.auth.isLoggedIn && this.auth.isbenview()))
      .subscribe(() => this.fetchOnce());
  }

  private stop(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
    this.startedForUser = null;
    this.previousPendingKeys = new Set();
    this.resolved = [];
    this.baselineReady = false;
    this.panelOpenSubject.next(false);
    this.itemsSubject.next([]);
  }

  private fetchOnce(): void {
    const userId = this.auth.user?.userId;
    if (!userId) {
      return;
    }

    const userBody = { userId, sessionUser: userId, isDeleted: 0 };
    const rejectedBody = { userId, sessionUser: userId };
    const closeBody = { userId, sessionUser: userId };

    const walletWithdrawBody = {
      coinType: 0,
      userId,
      sessionUser: userId,
    };

    forkJoin({
      createPending: this.api.listIdRequests(userBody).pipe(
        take(1),
        catchError(() => of(null))
      ),
      createRejected: this.api.RejectedRequestList(rejectedBody).pipe(
        take(1),
        catchError(() => of(null))
      ),
      // Match admin listing params currently used in production UI.
      deposits: this.api.GetDepositeCoinstoSiteRequestList(1, userId).pipe(
        take(1),
        catchError(() => of(null))
      ),
      withdraws: this.api.GetWithdrawCoinstoSiteRequestList(0, userId).pipe(
        take(1),
        catchError(() => of(null))
      ),
      walletWithdraws: this.api.GetWithdrawCoinsRequestList(walletWithdrawBody).pipe(
        take(1),
        catchError(() => of(null))
      ),
      closes: this.api.ListIDCloseRequest(closeBody).pipe(
        take(1),
        catchError(() => of(null))
      ),
    }).subscribe((bundle) => {
      this.applyBundle(bundle);
    });
  }

  private applyBundle(bundle: {
    createPending: unknown;
    createRejected: unknown;
    deposits: unknown;
    withdraws: unknown;
    walletWithdraws: unknown;
    closes: unknown;
  }): void {
    const pending: TrackedRequest[] = [];
    const now = Date.now();
    const userId = String(this.auth.user?.userId ?? '');

    for (const row of this.asList(bundle.createPending)) {
      if (!this.belongsToUser(row, userId)) {
        continue;
      }
      const id = this.pickId(row, ['accountRequestId', 'accountRequestID', 'AccountRequestId']);
      if (!id) {
        continue;
      }
      pending.push({
        key: `create-id:${id}`,
        kind: 'create-id',
        status: 'pending',
        title: 'Create ID request',
        subtitle: this.pickStr(row, ['siteName', 'SiteName']) || this.pickStr(row, ['userName', 'UserName']),
        createdDate: this.pickStr(row, ['createdDate', 'CreatedDate']),
        detail: 'Waiting for admin approval',
        updatedAt: now,
      });
    }

    for (const row of this.asList(bundle.deposits)) {
      if (!this.belongsToUser(row, userId)) {
        continue;
      }
      const id = this.pickId(row, ['coinsRequestId', 'CoinsRequestId']);
      if (!id) {
        continue;
      }
      const coins = this.pickStr(row, ['coins', 'Coins']);
      pending.push({
        key: `deposit:${id}`,
        kind: 'deposit',
        status: 'pending',
        title: 'Deposit request',
        subtitle: this.pickStr(row, ['siteName', 'SiteName']) || this.pickStr(row, ['accountUserName', 'AccountUserName']),
        amountLabel: coins ? `₹${coins}` : undefined,
        createdDate: this.pickStr(row, ['createdDate', 'CreatedDate']),
        detail: 'Payment proof submitted · waiting for admin',
        updatedAt: now,
      });
    }

    const withdrawRows = [
      ...this.asList(bundle.withdraws),
      ...this.asList(bundle.walletWithdraws),
    ];
    for (const row of withdrawRows) {
      if (!this.belongsToUser(row, userId)) {
        continue;
      }
      const id = this.pickId(row, ['coinsRequestId', 'CoinsRequestId']);
      if (!id) {
        continue;
      }
      const coins = this.pickStr(row, ['coins', 'Coins']);
      const key = `withdraw:${id}`;
      if (pending.some((x) => x.key === key)) {
        continue;
      }
      pending.push({
        key,
        kind: 'withdraw',
        status: 'pending',
        title: 'Withdrawal request',
        subtitle:
          this.pickStr(row, ['siteName', 'SiteName']) ||
          this.pickStr(row, ['accountUserName', 'AccountUserName']) ||
          'Wallet',
        amountLabel: coins ? `₹${coins}` : undefined,
        createdDate: this.pickStr(row, ['createdDate', 'CreatedDate']),
        detail: 'Waiting for admin to process payout',
        updatedAt: now,
      });
    }

    for (const row of this.asList(bundle.closes)) {
      if (!this.belongsToUser(row, userId)) {
        continue;
      }
      const id = this.pickId(row, ['accountId', 'AccountId', 'accountID', 'closeIdRequestId', 'CloseIdRequestId']);
      if (!id) {
        continue;
      }
      pending.push({
        key: `close-id:${id}`,
        kind: 'close-id',
        status: 'pending',
        title: 'Close ID request',
        subtitle: this.pickStr(row, ['siteName', 'SiteName']) || this.pickStr(row, ['userName', 'UserName']),
        createdDate: this.pickStr(row, ['createdDate', 'CreatedDate']),
        detail: 'Waiting for admin approval',
        updatedAt: now,
      });
    }

    const rejectedNow: TrackedRequest[] = [];
    for (const row of this.asList(bundle.createRejected)) {
      if (!this.belongsToUser(row, userId)) {
        continue;
      }
      const id = this.pickId(row, ['accountRequestId', 'accountRequestID', 'AccountRequestId']);
      if (!id) {
        continue;
      }
      rejectedNow.push({
        key: `create-id:${id}`,
        kind: 'create-id',
        status: 'rejected',
        title: 'Create ID request',
        subtitle: this.pickStr(row, ['siteName', 'SiteName']) || this.pickStr(row, ['userName', 'UserName']),
        createdDate: this.pickStr(row, ['createdDate', 'CreatedDate']),
        detail: this.pickStr(row, ['rejectionReason', 'RejectionReason']) || 'Rejected by admin',
        updatedAt: now,
      });
    }

    const pendingKeys = new Set(pending.map((x) => x.key));
    const rejectedKeys = new Set(rejectedNow.map((x) => x.key));

    if (!this.baselineReady) {
      this.previousPendingKeys = pendingKeys;
      this.baselineReady = true;
      // Keep already-known resolved items that are still recent.
      this.pruneResolved(now);
      // Surface current rejected create-ID items that are not already stored.
      for (const item of rejectedNow) {
        if (!this.resolved.some((x) => x.key === item.key && x.status === 'rejected')) {
          this.resolved.unshift(item);
        }
      }
      this.persist();
      this.publish(pending);
      return;
    }

    const newlyApproved: TrackedRequest[] = [];
    for (const key of this.previousPendingKeys) {
      if (pendingKeys.has(key) || rejectedKeys.has(key)) {
        continue;
      }
      const prior = this.itemsSubject.value.find((x) => x.key === key)
        || this.snapshotFromKey(key, now);
      if (!prior) {
        continue;
      }
      newlyApproved.push({
        ...prior,
        status: 'approved',
        detail: 'Approved by admin',
        updatedAt: now,
      });
    }

    const newlyRejected: TrackedRequest[] = [];
    for (const item of rejectedNow) {
      const already = this.resolved.some((x) => x.key === item.key && x.status === 'rejected');
      const wasPending = this.previousPendingKeys.has(item.key);
      if (!already && (wasPending || !this.resolved.some((x) => x.key === item.key))) {
        newlyRejected.push(item);
      }
    }

    for (const item of [...newlyApproved, ...newlyRejected]) {
      this.resolved = this.resolved.filter((x) => x.key !== item.key);
      this.resolved.unshift(item);
      this.notifyStatusChange(item);
    }

    this.previousPendingKeys = pendingKeys;
    this.pruneResolved(now);
    this.persist();
    this.publish(pending);
  }

  private snapshotFromKey(key: string, now: number): TrackedRequest | null {
    const [kind, id] = key.split(':') as [TrackedRequestKind, string];
    if (!kind || !id) {
      return null;
    }
    const titles: Record<TrackedRequestKind, string> = {
      'create-id': 'Create ID request',
      deposit: 'Deposit request',
      withdraw: 'Withdrawal request',
      'close-id': 'Close ID request',
    };
    return {
      key,
      kind,
      status: 'approved',
      title: titles[kind] || 'Request',
      detail: 'Approved by admin',
      updatedAt: now,
    };
  }

  private notifyStatusChange(item: TrackedRequest): void {
    const kindMap: Record<TrackedRequestKind, 'deposit' | 'withdraw' | 'create' | 'close' | 'info'> = {
      'create-id': 'create',
      deposit: 'deposit',
      withdraw: 'withdraw',
      'close-id': 'close',
    };
    this.toast.show({
      kind: kindMap[item.kind],
      title: item.status === 'approved' ? `${item.title} approved` : `${item.title} rejected`,
      subtitle: item.subtitle,
      amountLabel: item.amountLabel,
      detail: item.detail,
    });
  }

  private publish(pending: TrackedRequest[]): void {
    const merged = [
      ...pending.sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || '')),
      ...this.resolved,
    ];
    this.itemsSubject.next(merged);
  }

  private pruneResolved(now: number): void {
    this.resolved = this.resolved.filter((x) => now - x.updatedAt < this.resolvedKeepMs);
  }

  private belongsToUser(row: any, userId: string): boolean {
    if (!userId) {
      return false;
    }
    const rowUser = this.pickStr(row, ['userId', 'UserId']);
    // Coin-to-account listings are admin-scoped; never show another user's queue.
    return !!rowUser && rowUser === userId;
  }

  private asList(resp: unknown): any[] {
    if (!resp || typeof resp !== 'object') {
      return [];
    }
    const anyResp = resp as any;
    const status = anyResp.returnStatus ?? anyResp.ReturnStatus;
    if (status != null && status !== 1) {
      return [];
    }
    const list = anyResp.returnList ?? anyResp.ReturnList ?? [];
    return Array.isArray(list) ? list : [];
  }

  private pickId(row: any, keys: string[]): string {
    for (const key of keys) {
      const value = row?.[key];
      if (value != null && String(value).trim() !== '' && String(value) !== '0') {
        return String(value).trim();
      }
    }
    return '';
  }

  private pickStr(row: any, keys: string[]): string {
    for (const key of keys) {
      const value = row?.[key];
      if (value != null && String(value).trim() !== '') {
        return String(value).trim();
      }
    }
    return '';
  }

  private storageKey(userKey: string): string {
    return `${this.storagePrefix}${userKey}`;
  }

  private loadPersisted(userKey: string): void {
    try {
      const raw = localStorage.getItem(this.storageKey(userKey));
      if (!raw) {
        this.resolved = [];
        this.previousPendingKeys = new Set();
        this.baselineReady = false;
        return;
      }
      const parsed = JSON.parse(raw);
      this.resolved = Array.isArray(parsed?.resolved) ? parsed.resolved : [];
      this.previousPendingKeys = new Set(
        Array.isArray(parsed?.pendingKeys) ? parsed.pendingKeys.map((x: unknown) => String(x)) : []
      );
      this.baselineReady = !!parsed?.baselineReady;
      this.pruneResolved(Date.now());
    } catch {
      this.resolved = [];
      this.previousPendingKeys = new Set();
      this.baselineReady = false;
    }
  }

  private persist(): void {
    const userKey = String(this.auth.user?.userId ?? '');
    if (!userKey || userKey === '0') {
      return;
    }
    try {
      localStorage.setItem(
        this.storageKey(userKey),
        JSON.stringify({
          baselineReady: this.baselineReady,
          pendingKeys: [...this.previousPendingKeys],
          resolved: this.resolved,
        })
      );
    } catch {
      /* quota / private mode */
    }
  }
}
