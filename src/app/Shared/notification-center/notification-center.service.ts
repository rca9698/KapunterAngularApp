import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, combineLatest, interval, of } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { apiService } from 'src/app/api.service';
import { Ipassbook_detail_model } from 'src/app/Shared/Modals/passbook_detail_model';
import { PassbookUnreadService } from 'src/app/Shared/passbook-unread/passbook-unread.service';
import { RequestTrackerService } from 'src/app/Shared/request-tracker/request-tracker.service';
import { TrackedRequest } from 'src/app/Shared/request-tracker/request-tracker.models';
import { formatPassbookAmount } from 'src/app/Shared/Utils/passbook-display.util';
import { AppUpdateService, AppUpdateUiState } from 'src/app/Shared/platform/app-update.service';
import { ActivitySnapshotService } from 'src/app/Shared/activity-snapshot/activity-snapshot.service';

export type NotificationCenterSource = 'passbook' | 'request' | 'app-update' | 'custom';

export interface NotificationCenterItem {
  key: string;
  source: NotificationCenterSource;
  title: string;
  detail?: string;
  subtitle?: string;
  amountLabel?: string;
  whenLabel?: string;
  createdAt: number;
  unread: boolean;
  /** Server id for custom notifications (MarkNotificationRead). */
  notificationId?: number;
}

export interface CustomNotificationRow {
  notificationId: number;
  title: string;
  message: string;
  scheduledAtUtc: string;
  createdAtUtc: string;
  isRead: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationCenterService implements OnDestroy {
  private readonly seenPrefix = 'kp_notification_seen_';
  private readonly pollMs = 60000;
  private readonly itemsSubject = new BehaviorSubject<NotificationCenterItem[]>([]);
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly items$ = this.itemsSubject.asObservable();
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  private readonly sub: Subscription;
  private pollSub?: Subscription;
  private seenKeys = new Set<string>();
  private userKey = '';
  private passbookItems: Ipassbook_detail_model[] = [];
  private requestItems: TrackedRequest[] = [];
  private appUpdate: AppUpdateUiState | null = null;
  private customItems: CustomNotificationRow[] = [];
  private customFetchInFlight = false;

  constructor(
    private auth: AuthService,
    private api: apiService,
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
        this.customItems = [];
        this.syncCustomPolling(loggedIn);
      }
      this.passbookItems = loggedIn && this.auth.isbenview() ? passbookItems : [];
      this.requestItems = loggedIn && this.auth.isbenview() ? requestItems : [];
      this.appUpdate = appUpdate;
      if (!loggedIn || !this.auth.isbenview()) {
        this.customItems = [];
      }
      this.publish();
    });

    this.syncCustomPolling(this.auth.isLoggedIn);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.pollSub?.unsubscribe();
  }

  get unreadCount(): number {
    return this.unreadCountSubject.value;
  }

  refresh(): void {
    this.activitySnapshot.refreshNow();
    this.fetchCustomNotifications();
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

    if (item.source === 'custom') {
      this.markCustomRead(item);
      return;
    }

    this.seenKeys.add(item.key);
    this.persistSeen();
    this.publish();
  }

  markAllAsRead(): void {
    this.passbookUnread.markAllAsRead(this.passbookItems);
    for (const item of this.itemsSubject.value) {
      if (item.source === 'custom' && item.unread) {
        this.markCustomRead(item);
      } else if (item.source !== 'passbook' && item.source !== 'custom') {
        this.seenKeys.add(item.key);
      }
    }
    this.persistSeen();
    this.publish();
  }

  startAppUpdate(): void {
    void this.appUpdateService.startUpdate();
  }

  private syncCustomPolling(loggedIn: boolean): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;

    const shouldPoll = loggedIn && this.auth.isbenview();
    if (!shouldPoll) {
      this.customItems = [];
      this.publish();
      return;
    }

    this.fetchCustomNotifications();
    this.pollSub = interval(this.pollMs)
      .pipe(filter(() => document.visibilityState === 'visible'))
      .subscribe(() => this.fetchCustomNotifications());
  }

  private fetchCustomNotifications(): void {
    if (!this.auth.isLoggedIn || !this.auth.isbenview() || this.customFetchInFlight) {
      return;
    }
    this.customFetchInFlight = true;
    this.api
      .getNotifications({})
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: (resp: any) => {
          this.customFetchInFlight = false;
          if (!resp) {
            return;
          }
          const list = resp?.returnList ?? resp?.ReturnList ?? [];
          this.customItems = (Array.isArray(list) ? list : [])
            .map((row: any) => this.mapCustomRow(row))
            .filter((row: CustomNotificationRow) => row.notificationId > 0);
          this.publish();
        },
        error: () => {
          this.customFetchInFlight = false;
        }
      });
  }

  private mapCustomRow(row: any): CustomNotificationRow {
    return {
      notificationId: Number(row.notificationId ?? row.NotificationId ?? 0),
      title: String(row.title ?? row.Title ?? '').trim() || 'Announcement',
      message: String(row.message ?? row.Message ?? row.notificationDescription ?? row.NotificationDescription ?? '').trim(),
      scheduledAtUtc: String(row.scheduledAtUtc ?? row.ScheduledAtUtc ?? ''),
      createdAtUtc: String(row.createdAtUtc ?? row.CreatedAtUtc ?? ''),
      isRead: !!(row.isRead ?? row.IsRead)
    };
  }

  private markCustomRead(item: NotificationCenterItem): void {
    const id = item.notificationId;
    if (!id) {
      return;
    }
    const row = this.customItems.find((x) => x.notificationId === id);
    if (row && !row.isRead) {
      row.isRead = true;
      this.publish();
    }
    this.api.markNotificationRead({ notificationId: id }).pipe(catchError(() => of(null))).subscribe();
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

    for (const item of this.customItems) {
      const key = `custom:${item.notificationId}`;
      const when = this.toTime(item.scheduledAtUtc || item.createdAtUtc);
      items.push({
        key,
        source: 'custom',
        title: item.title,
        detail: item.message,
        whenLabel: this.formatWhen(when),
        createdAt: when,
        unread: !item.isRead,
        notificationId: item.notificationId
      });
    }

    items.sort((a, b) => b.createdAt - a.createdAt);
    this.itemsSubject.next(items.slice(0, 40));
    this.unreadCountSubject.next(items.filter((x) => x.unread).length);
  }

  private formatWhen(timestamp: number): string {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(timestamp));
    } catch {
      return new Date(timestamp).toLocaleString();
    }
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
