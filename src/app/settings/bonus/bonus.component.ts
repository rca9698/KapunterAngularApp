import { Component, OnInit } from '@angular/core';
import { apiService } from '../../api.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-bonus',
  templateUrl: './bonus.component.html',
  styleUrls: ['../shared/kp-content-page.css', './bonus.component.css']
})
export class BonusComponent implements OnInit {
  loading = true;
  availableBonus = 0;
  pendingBonus = 0;

  constructor(private api: apiService, private auth: AuthService) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn) {
      this.loading = false;
      return;
    }
    this.api.getMyBonus().subscribe({
      next: (resp: any) => {
        this.loading = false;
        const val = resp?.returnVal ?? resp?.ReturnVal ?? {};
        this.availableBonus = Number(val.availableBonus ?? val.AvailableBonus ?? 0);
        this.pendingBonus = Number(val.pendingBonus ?? val.PendingBonus ?? 0);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
