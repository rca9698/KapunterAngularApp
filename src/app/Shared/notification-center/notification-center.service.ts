import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { Ipassbook_detail_model } from 'src/app/Shared/Modals/passbook_detail_model';
import { PassbookUnreadService } from 'src/app/Shared/passbook-unread/passbook-unread.service';
import { RequestTrackerService } from 'src/app/Shared/request-tracker/request-tracker.service';
import { TrackedRequest } from 'src/app/Shared/request-tracker/request-tracker.models';
import { formatPassbookAmount } from 'src/app/Shared/Utils/passbook-display.util';
import { AppUpdateService, AppUpdateUiState } from 'src/app/Shared/platform/app-update.service';
import { ActivitySnapshotService } from 'src/app/Shared/activity-snapshot/activity-snapshot.service';

export type NotificationCenterSource = 'passbook' | 'request' | 'app-update';

export interface NotificationCenterItem {
  key: string;
  source: NotificationCenterSource;
  title: string;
  detail?: string;
  subtitle?: string;
  amountLabel?: string;
  createdAt: number;
  unread: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationCenterService implements OnDestroy {
  private readonly seenPrefix = 'kp_notification_seen_';
  private readonly itemsSubject = new BehaviorSubject<NotificationCenterItem[]>([]);
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly items$ = this.itemsSubject.asObservable();
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  private readonly sub: Subscription;
  private seenKeys = new Set<string>();
  private userKey = '';
  private passbookItems: Ipassbook_detail_model[] = [];
  private requestItems: TrackedRequest[] = [];
  private appUpdate: AppUpdateUiState | null = null;

  constructor(
    private auth: AuthService,
    private passbookUnread: PassbookUnreadService,
    private requestTracker: RequestTrackerService,
    private activitySnapshot: ActivitySnapshotService,
    private appUpdateService: AppUpdateService
  ) {
    this.sub = combineLatest([
      this.auth.isLoggenIn,
      this.passbookUnread.unreadItems$,
      this.requestTracker.items$,
      this.appUpdateService.ui$
    ]).subscribe(([loggedIn, passbookItems, requestItems, appUpdate]) => {
      const nextUserKey = loggedIn ? String(this.auth.user?.userId ?? '') : '';
      if (nextUserKey !== this.userKey) {
        this.userKey = nextUserKey;
        this.seenKeys = this.loadSeen();
      }
      this.passbookItems = loggedIn ? passbookItems : [];
      this.requestItems = loggedIn ? requestItems : [];
      this.appUpdate = appUpdate;
      this.publish();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get unreadCount(): number {
    return this.unreadCountSubject.value;
  }

  refresh(): void {
    this.activitySnapshot.refreshNow();
  }

  markAsRead(item: NotificationCenterItem): void {
    if (item.source === 'passbook') {
      const passbook = this.passbookItems.find(
        (x) => `passbook:${x.passbookHistoryId}` === item.key
      );
      if (passbook) {
        this.passbookUnread.markAsRead(passbook);
      }
      return;
    }

    this.seenKeys.add(item.key);
    this.persistSeen();
    this.publish();
  }

  markAllAsRead(): void {
    this.passbookUnread.markAllAsRead(this.passbookItems);
    for (const item of this.itemsSubject.value) {
      if (item.source !== 'passbook') {
        this.seenKeys.add(item.key);
      }
    }
    this.persistSeen();
    this.publish();
  }

  startAppUpdate(): void {
    void this.appUpdateService.startUpdate();
  }

  private publish(): void {
    const items: NotificationCenterItem[] = [];

    for (const item of this.passbookItems) {
      const key = `passbook:${item.passbookHistoryId}`;
      items.push({
        key,
        source: 'passbook',
        title: item.trxStatus?.trim() || 'Passbook update',
        subtitle: item.siteName || item.siteUserName,
        detail: item.activityDescription,
        amountLabel: formatPassbookAmount(item) ?? undefined,
        createdAt: this.toTime(item.approvedDate || item.createdDate),
        unread: true
      });
    }

    for (const item of this.requestItems.filter((x) => x.status !== 'pending')) {
      const key = `request:${item.key}:${item.status}`;
      items.push({
        key,
        source: 'request',
        title: `${item.title} ${item.status}`,
        subtitle: item.subtitle,
        detail: item.detail,
        amountLabel: item.amountLabel,
        createdAt: item.updatedAt,
        unread: !this.seenKeys.has(key)
      });
    }

    if (this.appUpdate?.visible && this.appUpdate.versionName) {
      const key = `app-update:${this.appUpdate.versionName}`;
      items.push({
        key,
        source: 'app-update',
        title: `Kapunter ${this.appUpdate.versionName} is available`,
        detail: this.appUpdate.releaseNotes || 'A new mobile app update is ready.',
        createdAt: Date.now(),
        unread: !this.seenKeys.has(key)
      });
    }

    items.sort((a, b) => b.createdAt - a.createdAt);
    this.itemsSubject.next(items.slice(0, 20));
    this.unreadCountSubject.next(items.filter((x) => x.unread).length);
  }

  private toTime(value: string | undefined): number {
    const timestamp = value ? Date.parse(value) : NaN;
    return Number.isFinite(timestamp) ? timestamp : Date.now();
  }

  private storageKey(): string {
    return `${this.seenPrefix}${this.userKey || 'guest'}`;
  }

  private loadSeen(): Set<string> {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.storageKey()) || '[]');
      return Array.isArray(parsed) ? new Set(parsed.map((x) => String(x))) : new Set();
    } catch {
      return new Set();
    }
  }

  private persistSeen(): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify([...this.seenKeys].slice(-200)));
    } catch {
      /* quota / private mode */
    }
  }
}
