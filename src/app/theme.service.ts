import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { apiService } from './api.service';

export type KapunterTheme = 'dark' | 'light';

const STORAGE_KEY = 'kapunter-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _theme$ = new BehaviorSubject<KapunterTheme>(this.readStored());
  private userId: bigint | null = null;

  readonly theme$ = this._theme$.asObservable();

  constructor(private apiservice: apiService) {
    this.apply(this._theme$.value);
  }

  get current(): KapunterTheme {
    return this._theme$.value;
  }

  setUserContext(userId: bigint | null): void {
    this.userId = userId && userId !== (0 as unknown as bigint) ? userId : null;
  }

  toggle(): void {
    this.set(this.current === 'dark' ? 'light' : 'dark');
  }

  applyUserPreference(preference: string | null | undefined): void {
    const theme = this.normalizeTheme(preference);
    if (!theme) {
      return;
    }

    this.set(theme, false);
  }

  set(theme: KapunterTheme, persistToBackend = true): void {
    if (theme === this.current) {
      return;
    }

    this._theme$.next(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.apply(theme);

    if (persistToBackend) {
      this.persistToBackend(theme);
    }
  }

  private persistToBackend(theme: KapunterTheme): void {
    if (!this.userId) {
      return;
    }

    this.apiservice.saveThemePreference({
      userId: this.userId,
      themePreference: theme
    }).subscribe({
      error: () => {
        // Keep local preference even if sync fails; will retry on next toggle.
      }
    });
  }

  private apply(theme: KapunterTheme): void {
    document.documentElement.setAttribute('data-kp-theme', theme);
  }

  private readStored(): KapunterTheme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const theme = this.normalizeTheme(stored);
      if (theme) {
        return theme;
      }
    } catch {
      // localStorage may be unavailable in some contexts
    }

    return 'dark';
  }

  private normalizeTheme(value: string | null | undefined): KapunterTheme | null {
    if (value === 'light' || value === 'dark') {
      return value;
    }

    return null;
  }
}
