import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { apiService } from 'src/app/api.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-image-module',
  templateUrl: './view-image-module.component.html',
  styleUrls: ['./view-image-module.component.css']
})
export class ViewImageModuleComponent implements OnInit {
  path: string = '';
  title: string = ''
  obj: any;
  docPath: string | undefined;
  
  returnType: any;
  returnValue: any;
  returnStatus: any;

  constructor(public bsModalRef:BsModalRef){}

  ngOnInit(): void {
    console.log(this.obj, 'obj in component');
    switch(this.path){
      case 'proof':
        this.docPath = environment.imagePath.proofPath;
        break;
      case 'qr':
        this.docPath = environment.imagePath.QR;
        break;
    }
  }
}
