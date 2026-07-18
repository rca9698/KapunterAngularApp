import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  NotificationCenterItem,
  NotificationCenterService
} from 'src/app/Shared/notification-center/notification-center.service';

@Component({
  selector: 'app-list-notification',
  templateUrl: './list-notification.component.html',
  styleUrls: ['./list-notification.component.css']
})
export class ListNotificationComponent {
  constructor(
    public notifications: NotificationCenterService,
    private router: Router
  ) {
    this.notifications.refresh();
  }

  open(item: NotificationCenterItem): void {
    this.notifications.markAsRead(item);
    if (item.source === 'passbook') {
      this.router.navigate(['/passbook/passbook-view-panel']);
    } else if (item.source === 'app-update') {
      this.notifications.startAppUpdate();
    } else if (item.source === 'custom' || item.source === 'request') {
      // Stay on list after mark-read; custom/request detail is already shown here.
    }
  }

  icon(item: NotificationCenterItem): string {
    if (item.source === 'app-update') return 'bi-phone';
    if (item.source === 'request') return 'bi-file-earmark-check';
    if (item.source === 'custom') return 'bi-megaphone-fill';
    return 'bi-journal-text';
  }
}
