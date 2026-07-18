import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';

export interface ClientLogEntry {
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: string;
}

interface StoredLogEntry extends ClientLogEntry {
  url: string;
  occurredAtUtc: string;
}

const LOCAL_LOG_KEY = 'kp_client_error_log';
const MAX_LOCAL_ENTRIES = 50;
const MAX_REPORTS_PER_MINUTE = 10;
const DUPLICATE_WINDOW_MS = 30_000;

/**
 * Central client-side logger: keeps a local ring buffer of unexpected errors
 * (inspectable via localStorage `kp_client_error_log`) and reports them to the
 * API so mobile/web crashes are traceable in the server logs.
 *
 * Deliberately dependency-free (uses fetch, not HttpClient) so it can run from
 * the global ErrorHandler without triggering interceptors or DI cycles.
 */
@Injectable({ providedIn: 'root' })
export class ClientLoggerService {
  private reportTimestamps: number[] = [];
  private recentSignatures = new Map<string, number>();

  logError(error: unknown, context?: string): void {
    const { message, stack } = this.normalizeError(error);
    this.log({ level: 'error', message, stack, context });
  }

  log(entry: ClientLogEntry): void {
    const stored: StoredLogEntry = {
      ...entry,
      url: this.safeUrl(),
      occurredAtUtc: new Date().toISOString(),
    };

    // Always keep a local copy, even if the network report fails.
    this.appendToLocalBuffer(stored);

    if (!this.shouldReport(entry)) {
      return;
    }
    void this.report(stored);
  }

  /** Recent errors stored on this device (newest last). */
  getLocalLog(): StoredLogEntry[] {
    try {
      const raw = localStorage.getItem(LOCAL_LOG_KEY);
      return raw ? (JSON.parse(raw) as StoredLogEntry[]) : [];
    } catch {
      return [];
    }
  }

  private async report(entry: StoredLogEntry): Promise<void> {
    try {
      const body = {
        level: entry.level,
        message: entry.message,
        stack: entry.stack ?? '',
        context: entry.context ?? '',
        platform: this.platform(),
        appVersion: this.appVersion(),
        url: entry.url,
        userId: this.currentUserId(),
        occurredAtUtc: entry.occurredAtUtc,
      };

      await fetch(`${environment.apiUrl}/api/ClientLog/Report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      });
    } catch {
      /* Reporting must never throw — the local buffer already has the entry. */
    }
  }

  private shouldReport(entry: ClientLogEntry): boolean {
    const now = Date.now();

    // Drop duplicates of the same error within a short window (e.g. change-detection loops).
    const signature = `${entry.level}|${entry.message}`.slice(0, 300);
    const lastSeen = this.recentSignatures.get(signature) ?? 0;
    if (now - lastSeen < DUPLICATE_WINDOW_MS) {
      return false;
    }
    this.recentSignatures.set(signature, now);
    if (this.recentSignatures.size > 100) {
      this.recentSignatures.clear();
      this.recentSignatures.set(signature, now);
    }

    // Simple rate limit so a broken page can't flood the API.
    this.reportTimestamps = this.reportTimestamps.filter((t) => now - t < 60_000);
    if (this.reportTimestamps.length >= MAX_REPORTS_PER_MINUTE) {
      return false;
    }
    this.reportTimestamps.push(now);
    return true;
  }

  private appendToLocalBuffer(entry: StoredLogEntry): void {
    try {
      const log = this.getLocalLog();
      log.push(entry);
      while (log.length > MAX_LOCAL_ENTRIES) {
        log.shift();
      }
      localStorage.setItem(LOCAL_LOG_KEY, JSON.stringify(log));
    } catch {
      /* storage may be full/unavailable — ignore */
    }
  }

  private normalizeError(error: unknown): { message: string; stack?: string } {
    if (error instanceof Error) {
      return { message: error.message || String(error), stack: error.stack };
    }
    if (error && typeof error === 'object') {
      const anyErr = error as Record<string, unknown>;
      const message =
        (typeof anyErr['message'] === 'string' && anyErr['message']) ||
        this.safeStringify(error);
      const stack = typeof anyErr['stack'] === 'string' ? (anyErr['stack'] as string) : undefined;
      return { message, stack };
    }
    return { message: String(error) };
  }

  private safeStringify(value: unknown): string {
    try {
      return JSON.stringify(value)?.slice(0, 1500) ?? String(value);
    } catch {
      return String(value);
    }
  }

  private safeUrl(): string {
    try {
      return typeof window !== 'undefined' ? window.location.href : '';
    } catch {
      return '';
    }
  }

  private platform(): string {
    try {
      return Capacitor.getPlatform();
    } catch {
      return 'web';
    }
  }

  private appVersion(): string {
    return environment.environment || 'prod';
  }

  /** Read the userId from the stored JWT without pulling in AuthService (avoids DI cycles). */
  private currentUserId(): number {
    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        return 0;
      }
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return 0;
      }
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
      const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
      return Number(payload['userid'] ?? payload['UserId'] ?? 0) || 0;
    } catch {
      return 0;
    }
  }
}
