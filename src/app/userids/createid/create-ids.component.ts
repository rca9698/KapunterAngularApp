import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UserIdsService } from '../user-ids.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { AddIDRequest, IAddIDRequest } from 'src/app/Shared/Modals/Ids/add-ids-request';
import { AuthService } from 'src/app/auth.service';
import { environment } from 'src/environments/environment';
import { PassbookActivityToastService } from 'src/app/Shared/passbook-activity-toast/passbook-activity-toast.service';

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
    private toasterService: ToastrService, private authservice: AuthService,
    private passbookToast: PassbookActivityToastService){
      this._sessionUser = authservice.user.userId;
      this.AddIdsFrom = this.formBuilder.group({
        username: ['', [Validators.required]]
       },
     )
     
     this.sitePath = environment.imagePath?.sitePath || '';
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
      next:(response: any)=>{
        if ((response?.returnStatus ?? response?.ReturnStatus) === 1) {
          this.bsModalRef.hide();
          this.passbookToast.show({
            kind: 'create',
            title: 'ID request submitted',
            subtitle: this.obj?.siteName || 'Platform',
            detail: `Username: ${this.addIDRequest.userName}`,
          });
          this.toasterService.success(response?.returnMessage ?? 'ID request submitted.');
          this.router.navigate(['/site/app-get-user-list-site-by-id'], { queryParams: { view: 'active' } });
        } else {
          this.toasterService.warning(response?.returnMessage ?? response?.ReturnMessage ?? 'Unable to create ID request.');
        }
      },
      error: () => {
        this.toasterService.warning('Unable to create ID request.');
      }
    }); 
     
    }
  } 