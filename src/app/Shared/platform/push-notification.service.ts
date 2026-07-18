import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { apiService } from 'src/app/api.service';
import { NotificationCenterService } from 'src/app/Shared/notification-center/notification-center.service';
import { isNativeApp } from './platform.util';

/**
 * Capacitor push registration for native Android.
 * Safe on web: initialize() is a no-op outside the native shell.
 */
@Injectable({ providedIn: 'root' })
export class PushNotificationService implements OnDestroy {
  private authSub?: Subscription;
  private listenersAttached = false;
  private registering = false;
  private currentToken: string | null = null;
  private lastUserKey = '';

  constructor(
    private auth: AuthService,
    private api: apiService,
    private notifications: NotificationCenterService,
    private router: Router
  ) {}

  /** Call once from app root. Subscribes to auth and registers only when native + logged in. */
  initialize(): void {
    if (!isNativeApp() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    if (this.authSub) {
      return;
    }

    this.authSub = this.auth.isLoggenIn.subscribe((loggedIn) => {
      const userKey = loggedIn ? String(this.auth.user?.userId ?? '') : '';
      if (loggedIn && userKey) {
        if (userKey !== this.lastUserKey) {
          this.lastUserKey = userKey;
          void this.registerForUser();
        }
      } else {
        this.lastUserKey = '';
        void this.unregisterCurrentToken();
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  private async registerForUser(): Promise<void> {
    if (this.registering) {
      return;
    }
    this.registering = true;
    try {
      await this.ensureListeners();

      let perm = await PushNotifications.checkPermissions();
      if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
        perm = await PushNotifications.requestPermissions();
      }
      if (perm.receive !== 'granted') {
        return;
      }

      await PushNotifications.register();
    } catch {
      /* plugin / permission failures are non-fatal for web-parity */
    } finally {
      this.registering = false;
    }
  }

  private async ensureListeners(): Promise<void> {
    if (this.listenersAttached) {
      return;
    }
    this.listenersAttached = true;

    await PushNotifications.addListener('registration', (token: Token) => {
      this.currentToken = token?.value || null;
      if (!this.currentToken || !this.auth.isLoggedIn) {
        return;
      }
      this.api
        .registerDevice({ token: this.currentToken, platform: 'android' })
        .subscribe({ error: () => undefined });
    });

    await PushNotifications.addListener('registrationError', () => {
      /* keep silent; user can still use in-app notification center */
    });

    await PushNotifications.addListener('pushNotificationReceived', (_notification: PushNotificationSchema) => {
      this.notifications.refresh();
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (_action: ActionPerformed) => {
      this.notifications.refresh();
      void this.router.navigate(['/notification/list-notification']);
    });
  }

  private async unregisterCurrentToken(): Promise<void> {
    const token = this.currentToken;
    this.currentToken = null;
    if (!token) {
      return;
    }
    this.api.unregisterDevice({ token }).subscribe({ error: () => undefined });
  }
}
