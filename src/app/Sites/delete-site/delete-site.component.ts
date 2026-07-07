import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { SitesService } from '../sites.service';

@Component({
  selector: 'app-delete-site',
  templateUrl: './delete-site.component.html',
  styleUrls: ['./delete-site.component.css']
})
export class DeleteSiteComponent {
  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private sitesService: SitesService, 
    private toasterService: ToastrService){
      
  }
}
