import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/api.service';
import { ToastrService } from 'src/app/toastr/toastr.service';

export interface ScheduledNotificationRow {
  notificationId: number;
  title: string;
  message: string;
  scheduledAtUtc: string;
  createdAtUtc: string;
  createdBy: number;
  isActive: boolean;
  status: string;
  sentAtUtc: string;
  sentCount: number;
  failedCount: number;
  lastError: string;
}

@Component({
  selector: 'app-admin-schedule-notifications',
  templateUrl: './admin-schedule-notifications.component.html',
  styleUrls: ['./admin-schedule-notifications.component.css']
})
export class AdminScheduleNotificationsComponent implements OnInit {
  title = '';
  message = '';
  scheduledLocal = '';
  submitting = false;
  loadingList = false;
  rows: ScheduledNotificationRow[] = [];

  readonly titleMax = 120;
  readonly messageMax = 1000;

  constructor(
    private api: apiService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadScheduled();
  }

  get titleLen(): number {
    return (this.title || '').length;
  }

  get messageLen(): number {
    return (this.message || '').length;
  }

  schedule(): void {
    const title = (this.title || '').trim();
    const message = (this.message || '').trim();
    const localValue = (this.scheduledLocal || '').trim();

    if (!title) {
      this.toaster.warning('Title is required.');
      return;
    }
    if (title.length > this.titleMax) {
      this.toaster.warning(`Title must be ${this.titleMax} characters or fewer.`);
      return;
    }
    if (!message) {
      this.toaster.warning('Message is required.');
      return;
    }
    if (message.length > this.messageMax) {
      this.toaster.warning(`Message must be ${this.messageMax} characters or fewer.`);
      return;
    }
    if (!localValue) {
      this.toaster.warning('Schedule date and time are required.');
      return;
    }

    const localDate = new Date(localValue);
    if (!Number.isFinite(localDate.getTime())) {
      this.toaster.warning('Enter a valid date and time.');
      return;
    }
    if (localDate.getTime() <= Date.now()) {
      this.toaster.warning('Scheduled time must be in the future.');
      return;
    }

    const scheduledAtUtc = localDate.toISOString();
    this.submitting = true;
    this.api.scheduleNotification({ title, message, scheduledAtUtc }).subscribe({
      next: (resp: any) => {
        this.submitting = false;
        const status = resp?.returnStatus ?? resp?.ReturnStatus;
        const msg = resp?.returnMessage ?? resp?.ReturnMessage ?? '';
        if (status === 1 || status === true || status === '1') {
          this.toaster.success(msg || 'Notification scheduled.');
          this.title = '';
          this.message = '';
          this.scheduledLocal = '';
          this.loadScheduled();
        } else {
          this.toaster.warning(msg || 'Unable to schedule notification.');
        }
      },
      error: () => {
        this.submitting = false;
        this.toaster.error('Unable to schedule notification.');
      }
    });
  }

  loadScheduled(): void {
    this.loadingList = true;
    this.api.getScheduledNotifications().subscribe({
      next: (resp: any) => {
        this.loadingList = false;
        const list = resp?.returnList ?? resp?.ReturnList ?? [];
        this.rows = (Array.isArray(list) ? list : []).map((row: any) => ({
          notificationId: Number(row.notificationId ?? row.NotificationId ?? 0),
          title: String(row.title ?? row.Title ?? ''),
          message: String(row.message ?? row.Message ?? ''),
          scheduledAtUtc: String(row.scheduledAtUtc ?? row.ScheduledAtUtc ?? ''),
          createdAtUtc: String(row.createdAtUtc ?? row.CreatedAtUtc ?? ''),
          createdBy: Number(row.createdBy ?? row.CreatedBy ?? 0),
          isActive: !!(row.isActive ?? row.IsActive),
          status: String(row.status ?? row.Status ?? ''),
          sentAtUtc: String(row.sentAtUtc ?? row.SentAtUtc ?? ''),
          sentCount: Number(row.sentCount ?? row.SentCount ?? 0),
          failedCount: Number(row.failedCount ?? row.FailedCount ?? 0),
          lastError: String(row.lastError ?? row.LastError ?? '')
        }));
      },
      error: () => {
        this.loadingList = false;
        this.rows = [];
        this.toaster.warning('Unable to load scheduled notifications.');
      }
    });
  }

  formatUtc(value: string): string {
    if (!value) {
      return '—';
    }
    const ts = Date.parse(value);
    if (!Number.isFinite(ts)) {
      return value;
    }
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(ts));
    } catch {
      return new Date(ts).toLocaleString();
    }
  }
}
