import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.token) {
      this.authService.getUserDetails();
    }
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
