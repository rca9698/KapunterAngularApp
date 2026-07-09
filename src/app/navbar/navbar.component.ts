import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountsService } from '../Accounts/accounts.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { VisitorCountService } from '../visitor-count.service';
import { ThemeService } from '../theme.service';
import { Subscription } from 'rxjs';
import { VisitorStats } from '../Shared/Modals/visitor-stats';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  displayTotal = 0;
  stats: VisitorStats = { totalVisits: 0, todayVisits: 0, weekVisits: 0 };
  private statsSub?: Subscription;
  private animationFrame: number | null = null;

  constructor(
    private accountService: AccountsService,
    public authservice: AuthService,
    private router: Router,
    public visitorCountService: VisitorCountService,
    public themeService: ThemeService
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
    this.router.navigate(['/account/profile-details']);
  }

  logout(): void {
    this.authservice.logout();
  }

  toggleTheme(): void {
    this.themeService.toggle();
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
