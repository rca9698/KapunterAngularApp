import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, interval, of } from 'rxjs';
import { catchError, filter, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { PassbookService } from 'src/app/Passbook/passbook.service';
import { Ipassbook_detail_model } from 'src/app/Shared/Modals/passbook_detail_model';
import { PassbookActivityToastService } from 'src/app/Shared/passbook-activity-toast/passbook-activity-toast.service';

@Injectable({ providedIn: 'root' })
export class PassbookUnreadService implements OnDestroy {
  private readonly storagePrefix = 'kp_passbook_seen_';
  private readonly pollMs = 45000;
  private readonly unreadSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadSubject.asObservable();

  private authSub?: Subscription;
  private pollSub?: Subscription;
  private knownIds = new Set<string>();
  private seenIds = new Set<string>();
  private startedForUser: string | null = null;

  constructor(
    private auth: AuthService,
    private passbookService: PassbookService,
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

  get unreadCount(): number {
    return this.unreadSubject.value;
  }

  /** Call when beneficiary opens the passbook list — clears the badge. */
  markAllAsRead(entries?: Ipassbook_detail_model[]): void {
    if (entries?.length) {
      for (const item of entries) {
        const id = this.idOf(item);
        if (id) {
          this.seenIds.add(id);
          this.knownIds.add(id);
        }
      }
    } else {
      for (const id of this.knownIds) {
        this.seenIds.add(id);
      }
    }
    this.persistSeen();
    this.unreadSubject.next(0);
  }

  refresh(): void {
    if (!this.auth.isLoggedIn || !this.auth.isbenview()) {
      return;
    }
    this.fetchOnce();
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
    this.seenIds = this.loadSeen(userKey);
    this.knownIds = new Set(this.seenIds);
    this.fetchOnce();

    this.pollSub = interval(this.pollMs)
      .pipe(filter(() => this.auth.isLoggedIn && this.auth.isbenview()))
      .subscribe(() => this.fetchOnce());
  }

  private stop(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
    this.startedForUser = null;
    this.knownIds = new Set();
    this.seenIds = new Set();
    this.unreadSubject.next(0);
  }

  private fetchOnce(): void {
    const userId = this.auth.user?.userId;
    if (!userId) {
      return;
    }

    const obj = {
      userId,
      siteId: 1,
      sessionUser: userId
    };

    this.passbookService
      .passbookHistorylist(obj)
      .pipe(
        take(1),
        catchError(() => of(null))
      )
      .subscribe((resp: any) => {
        const status = resp?.returnStatus ?? resp?.ReturnStatus;
        if (status != null && status !== 1) {
          return;
        }
        const list: Ipassbook_detail_model[] =
          resp?.returnList ?? resp?.ReturnList ?? [];
        this.applyList(list);
      });
  }

  private applyList(list: Ipassbook_detail_model[]): void {
    const userKey = String(this.auth.user?.userId ?? '');
    const storageKey = this.storageKey(userKey);
    const hasBaseline = localStorage.getItem(storageKey) !== null;

    const currentIds: string[] = [];
    for (const item of list) {
      const id = this.idOf(item);
      if (id) {
        currentIds.push(id);
      }
    }

    // First run for this user: seed seen set with existing history so only future entries count.
    if (!hasBaseline) {
      this.seenIds = new Set(currentIds);
      this.knownIds = new Set(currentIds);
      this.persistSeen();
      this.unreadSubject.next(0);
      return;
    }

    const newlyDiscovered: Ipassbook_detail_model[] = [];
    for (const item of list) {
      const id = this.idOf(item);
      if (!id) {
        continue;
      }
      if (!this.knownIds.has(id)) {
        newlyDiscovered.push(item);
        this.knownIds.add(id);
      }
    }

    let unread = 0;
    for (const id of currentIds) {
      if (!this.seenIds.has(id)) {
        unread++;
      }
    }
    this.unreadSubject.next(unread);

    for (const item of newlyDiscovered.slice(0, 2)) {
      this.toast.show({
        kind: this.kindFrom(item),
        title: item.trxStatus?.trim() || 'Passbook update',
        subtitle: item.siteName || item.activityDescription,
        detail: item.activityDescription,
        amountLabel: item.displayCoins || (item.coins != null ? `₹${item.coins}` : undefined)
      });
    }
  }

  private kindFrom(item: Ipassbook_detail_model): 'deposit' | 'withdraw' | 'create' | 'close' | 'info' {
    const text = `${item.trxStatus || ''} ${item.activityDescription || ''}`.toLowerCase();
    if (text.includes('deposit') || text.includes('deposite')) return 'deposit';
    if (text.includes('withdraw')) return 'withdraw';
    if (text.includes('create') || text.includes('new id')) return 'create';
    if (text.includes('close') || text.includes('remove')) return 'close';
    return 'info';
  }

  private idOf(item: Ipassbook_detail_model): string {
    return String(item?.passbookHistoryId ?? '').trim();
  }

  private storageKey(userKey: string): string {
    return `${this.storagePrefix}${userKey}`;
  }

  private loadSeen(userKey: string): Set<string> {
    try {
      const raw = localStorage.getItem(this.storageKey(userKey));
      if (!raw) {
        return new Set();
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((x) => String(x)).filter(Boolean));
      }
    } catch {
      /* ignore corrupt storage */
    }
    return new Set();
  }

  private persistSeen(): void {
    const userKey = String(this.auth.user?.userId ?? '');
    if (!userKey || userKey === '0') {
      return;
    }
    try {
      localStorage.setItem(this.storageKey(userKey), JSON.stringify([...this.seenIds]));
    } catch {
      /* quota / private mode */
    }
  }
}
