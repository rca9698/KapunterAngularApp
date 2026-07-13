import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type PassbookActivityKind = 'deposit' | 'withdraw' | 'create' | 'close' | 'info';

export interface PassbookActivityToast {
  id: number;
  kind: PassbookActivityKind;
  title: string;
  subtitle?: string;
  detail?: string;
  amountLabel?: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class PassbookActivityToastService {
  private seq = 0;
  private readonly itemsSubject = new BehaviorSubject<PassbookActivityToast[]>([]);
  readonly items$ = this.itemsSubject.asObservable();

  show(input: Omit<PassbookActivityToast, 'id' | 'createdAt'>): void {
    const toast: PassbookActivityToast = {
      ...input,
      id: ++this.seq,
      createdAt: Date.now()
    };
    const next = [toast, ...this.itemsSubject.value].slice(0, 3);
    this.itemsSubject.next(next);
    window.setTimeout(() => this.dismiss(toast.id), 5200);
  }

  dismiss(id: number): void {
    this.itemsSubject.next(this.itemsSubject.value.filter(t => t.id !== id));
  }

  clear(): void {
    this.itemsSubject.next([]);
  }
}
