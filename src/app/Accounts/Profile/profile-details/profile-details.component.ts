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
}
