import { Component } from '@angular/core';
import { RequestTrackerService } from './request-tracker.service';
import { TrackedRequest } from './request-tracker.models';

@Component({
  selector: 'app-request-tracker-panel',
  templateUrl: './request-tracker-panel.component.html',
  styleUrls: ['./request-tracker-panel.component.css'],
})
export class RequestTrackerPanelComponent {
  constructor(public tracker: RequestTrackerService) {}

  trackByKey(_: number, item: TrackedRequest): string {
    return item.key;
  }

  kindIcon(kind: TrackedRequest['kind']): string {
    switch (kind) {
      case 'deposit':
        return 'bi-arrow-down-circle';
      case 'withdraw':
        return 'bi-arrow-up-circle';
      case 'close-id':
        return 'bi-x-octagon';
      default:
        return 'bi-person-badge';
    }
  }

  statusLabel(status: TrackedRequest['status']): string {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'In review';
    }
  }
}
