import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  PassbookActivityToast,
  PassbookActivityToastService
} from './passbook-activity-toast.service';

@Component({
  selector: 'app-passbook-activity-toast',
  templateUrl: './passbook-activity-toast.component.html',
  styleUrls: ['./passbook-activity-toast.component.css']
})
export class PassbookActivityToastComponent implements OnInit, OnDestroy {
  items: PassbookActivityToast[] = [];
  private sub?: Subscription;

  constructor(
    private toastService: PassbookActivityToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.toastService.items$.subscribe(items => {
      this.items = items;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  iconFor(kind: string): string {
    switch (kind) {
      case 'deposit': return 'bi-arrow-down-circle';
      case 'withdraw': return 'bi-arrow-up-circle';
      case 'create': return 'bi-person-plus';
      case 'close': return 'bi-archive';
      default: return 'bi-journal-text';
    }
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  viewPassbook(id: number): void {
    this.toastService.dismiss(id);
    this.router.navigate(['/passbook/passbook-view-panel']);
  }
}
