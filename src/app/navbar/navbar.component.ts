import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AccountsService } from '../Accounts/accounts.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { VisitorCountService } from '../visitor-count.service';
import { ThemeService } from '../theme.service';
import { Subscription } from 'rxjs';
import { VisitorStats } from '../Shared/Modals/visitor-stats';
import { getApkDownloadUrl, isNativeApp } from '../Shared/platform/platform.util';
import { AppShareService } from '../Shared/platform/app-share.service';
import {
  NotificationCenterItem,
  NotificationCenterService
} from '../Shared/notification-center/notification-center.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  displayTotal = 0;
  stats: VisitorStats = { totalVisits: 0, todayVisits: 0, weekVisits: 0, activeSessions: 0 };
  readonly isNativeApp = isNativeApp();
  accountMenuOpen = false;
  notificationMenuOpen = false;
  private statsSub?: Subscription;
  private animationFrame: number | null = null;

  constructor(
    private accountService: AccountsService,
    public authservice: AuthService,
    private router: Router,
    public visitorCountService: VisitorCountService,
    public themeService: ThemeService,
    private appShareService: AppShareService,
    public notifications: NotificationCenterService,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.statsSub = this.visitorCountService.stats$.subscribe((stats) => {
      this.stats = stats;
      this.animateCount(stats.totalVisits);
    });
  }

  ngOnDestroy(): void {
    this.statsSub?.unsubscribe();
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  RedirectToHome(){
    this.router.navigate(['/']);
  }

  loginPopup() {
    this.accountService.OpenLoginPopup(true, 'Login');
  }

  goToMyAccount() {
    this.accountMenuOpen = false;
    this.router.navigate(['/account/profile-details']);
  }

  toggleAccountMenu(event: Event): void {
    event.stopPropagation();
    this.notificationMenuOpen = false;
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  toggleNotificationMenu(event: Event): void {
    event.stopPropagation();
    this.accountMenuOpen = false;
    this.notificationMenuOpen = !this.notificationMenuOpen;
    if (this.notificationMenuOpen) {
      this.notifications.refresh();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.accountMenuOpen && !this.notificationMenuOpen) {
      return;
    }
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.accountMenuOpen = false;
      this.notificationMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.accountMenuOpen = false;
    this.notificationMenuOpen = false;
  }

  logout(): void {
    this.accountMenuOpen = false;
    this.authservice.logout();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  downloadAndroidApp(): void {
    if (this.isNativeApp) {
      return;
    }
    window.open(getApkDownloadUrl(), '_blank', 'noopener');
  }

  shareApp(): void {
    void this.appShareService.shareKapunterApp();
  }

  openNotification(item: NotificationCenterItem): void {
    this.notifications.markAsRead(item);
    this.notificationMenuOpen = false;
    if (item.source === 'passbook') {
      this.router.navigate(['/passbook/passbook-view-panel']);
    } else if (item.source === 'app-update') {
      this.notifications.startAppUpdate();
    } else {
      this.router.navigate(['/notification/list-notification']);
    }
  }

  markAllNotificationsRead(event: Event): void {
    event.stopPropagation();
    this.notifications.markAllAsRead();
  }

  notificationIcon(item: NotificationCenterItem): string {
    if (item.source === 'app-update') return 'bi-phone';
    if (item.source === 'request') return 'bi-file-earmark-check';
    return 'bi-journal-text';
  }

  formatCount(value: number): string {
    return new Intl.NumberFormat('en-IN').format(value ?? 0);
  }

  private animateCount(target: number): void {
    const start = this.displayTotal;
    const delta = target - start;
    if (delta === 0) {
      return;
    }

    const duration = 700;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayTotal = Math.round(start + delta * eased);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      } else {
        this.displayTotal = target;
        this.animationFrame = null;
      }
    };

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animationFrame = requestAnimationFrame(step);
  }
}
