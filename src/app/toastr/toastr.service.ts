import { Injectable } from '@angular/core';

export type AppNoticeKind = 'success' | 'warning' | 'error' | 'info';

export interface AppNotice {
  id: number;
  kind: AppNoticeKind;
  title: string;
  message?: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastrService {
  private seq = 0;
  /** @deprecated Prefer `notices` — kept for any template that still reads `toasts`. */
  toasts: Array<{ type: string; message?: string }> = [];
  notices: AppNotice[] = [];

  private readonly titles: Record<AppNoticeKind, string> = {
    success: 'Saved',
    warning: 'Please check',
    error: 'Something went wrong',
    info: 'FYI'
  };

  success(message: string | undefined, title?: string) {
    this.push('success', message, title);
  }

  warning(message: string | undefined, title?: string) {
    this.push('warning', message, title);
  }

  error(message: string | undefined, title?: string) {
    this.push('error', message, title);
  }

  info(message: string | undefined, title?: string) {
    this.push('info', message, title);
  }

  /** Rich notice for long-term UX (title + detail). */
  notice(kind: AppNoticeKind, title: string, message?: string) {
    this.push(kind, message, title);
  }

  remove(notice: AppNotice | { type?: string; message?: string }) {
    if ('id' in notice) {
      this.notices = this.notices.filter((n) => n.id !== notice.id);
    }
    this.toasts = this.toasts.filter((t) => t !== notice);
  }

  dismiss(id: number) {
    this.notices = this.notices.filter((n) => n.id !== id);
  }

  private push(kind: AppNoticeKind, message: string | undefined, title?: string) {
    const notice: AppNotice = {
      id: ++this.seq,
      kind,
      title: (title || '').trim() || this.titles[kind],
      message: (message || '').trim() || undefined,
      createdAt: Date.now()
    };
    this.notices = [notice, ...this.notices].slice(0, 4);
    // Legacy mirror for old templates
    this.toasts = this.notices.map((n) => ({ type: n.kind, message: n.message || n.title }));

    window.setTimeout(() => this.dismiss(notice.id), kind === 'error' ? 6500 : 4200);
  }
}
