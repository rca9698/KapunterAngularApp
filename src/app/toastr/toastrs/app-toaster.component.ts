import { Component } from '@angular/core';
import { ToastrService } from '../toastr.service';

@Component({
  selector: 'app-toaster',
  templateUrl: './app-toaster.component.html',
  styleUrls: ['./app-toaster.component.css']
})
export class AppToasterComponent {
  constructor(public toasterService: ToastrService) { }

  remove(toast: any) {
    this.toasterService.remove(toast);
  }
}
