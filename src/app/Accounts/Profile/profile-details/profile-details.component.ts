import { Component, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { ThemeService, KapunterTheme } from 'src/app/theme.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {
  loading = false;
  loadError = '';

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private toasterService: ToastrService,
    private bsModalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    if (!this.authService.token) {
      return;
    }

    const request$ = this.authService.getUserDetails();
    if (!request$) {
      this.loadError = 'Unable to load profile. Please sign in again.';
      return;
    }

    this.loading = true;
    this.loadError = '';

    request$.pipe(finalize(() => {
      this.loading = false;
    })).subscribe({
      next: () => {
        const status = this.authService.returnType?.returnStatus ?? this.authService.returnType?.ReturnStatus;
        if (status != null && status !== 1) {
          this.loadError = this.authService.returnType?.returnMessage ?? 'Unable to load profile data.';
          this.toasterService.warning(this.loadError);
        }
      },
      error: () => {
        this.loadError = 'Unable to load profile data.';
        this.toasterService.warning(this.loadError);
      }
    });
  }

  openChangePasswordModal(): void {
    this.bsModalService.show(ChangePasswordModalComponent, {
      class: 'modal-dialog-centered'
    });
  }

  setTheme(theme: KapunterTheme): void {
    this.themeService.set(theme);
  }

  formatJoinDate(date: string | undefined): string {
    if (!date?.trim()) {
      return '—';
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return `${parsedDate.getDate()}-${months[parsedDate.getMonth()]}-${parsedDate.getFullYear()}`;
  }
}
