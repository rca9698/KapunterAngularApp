import { Component } from '@angular/core';
import { AppNotice, ToastrService } from '../toastr.service';

@Component({
  selector: 'app-toaster',
  templateUrl: './app-toaster.component.html',
  styleUrls: ['./app-toaster.component.css']
})
export class AppToasterComponent {
  constructor(public toasterService: ToastrService) {}

  iconFor(kind: AppNotice['kind']): string {
    switch (kind) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'error':
        return 'bi-x-octagon-fill';
      default:
        return 'bi-info-circle-fill';
    }
  }

  dismiss(id: number): void {
    this.toasterService.dismiss(id);
  }

  trackById(_i: number, n: AppNotice): number {
    return n.id;
  }
}
