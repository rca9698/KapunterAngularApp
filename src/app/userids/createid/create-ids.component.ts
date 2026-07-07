import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UserIdsService } from '../user-ids.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { AddIDRequest, IAddIDRequest } from 'src/app/Shared/Modals/Ids/add-ids-request';
import { AuthService } from 'src/app/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-ids',
  templateUrl: './create-ids.component.html',
  styleUrls: ['./create-ids.component.css']
})
export class CreateIdsComponent {
  obj: any;

  sitePath: string | undefined;
  AddIdsFrom: FormGroup;
  submitted : boolean = false;
  addIDRequest : IAddIDRequest = new AddIDRequest();
  readonly _sessionUser: bigint;

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private useridsservice: UserIdsService, 
    private toasterService: ToastrService, private authservice: AuthService){
      this._sessionUser = authservice.user.userId;
      this.AddIdsFrom = this.formBuilder.group({
        username: ['', [Validators.required]]
       },
     )
     
     this.sitePath = environment.imagePath.sitePath;
  }


  AddUserId() {
    this.submitted = true;
    
    if(this.AddIdsFrom.invalid) {
      return;
    }

    this.addIDRequest.userName = this.AddIdsFrom.value["username"].toString();
    this.addIDRequest.UserId = this._sessionUser;
    this.addIDRequest.sessionUser = this._sessionUser;
    this.addIDRequest.siteid = this.obj.siteId;

    this.useridsservice.AddIDRequest(this.addIDRequest)?.subscribe({
      next:(response)=>{
        this.bsModalRef.hide();
        this.router.navigate(['/userids/list-user-ids'])
      }}
    ); 
     
    }
  } 