import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'src/app/toastr/toastr.service';

@Component({
  selector: 'app-delet-image',
  templateUrl: './delet-image.component.html',
  styleUrls: ['./delet-image.component.css']
})
export class DeletImageComponent {
constructor(public bsModalRef:BsModalRef, 
    private router:Router, 
    private toasterService: ToastrService){
      
  }
}
