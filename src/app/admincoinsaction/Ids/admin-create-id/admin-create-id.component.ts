import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Iadmin_add_id, admin_add_id } from 'src/app/Shared/Modals/Ids/admin_add_id';
import { IdsService } from '../ids.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { AuthService } from 'src/app/auth.service';
import { environment } from 'src/environments/environment';
import { resolveAccountRequestId } from '../../shared/id-request.util';

@Component({
  selector: 'app-admin-create-id',
  templateUrl: './admin-create-id.component.html',
  styleUrls: ['./admin-create-id.component.css']
})
export class AdminCreateIdComponent {
  obj: any;
  
  submitted: boolean = false;
  AdminCreateIdForm: FormGroup;
  admin_add_id : Iadmin_add_id = new admin_add_id();
  returnType: any;
  sitePath: string | undefined;

  private readonly _sessionUser: bigint;
  constructor(public bsModalRef:BsModalRef, private formBuilder: FormBuilder,
    private router:Router, private idsservice: IdsService
    , private toasterService: ToastrService, private authservice: AuthService){
      this.AdminCreateIdForm = this.formBuilder.group({
        userName: ['', [Validators.required]],
        password: ['', [Validators.required]],
       },
     )
     this._sessionUser = authservice.user.userId;
     this.sitePath = environment.imagePath.sitePath;
  }

  AdminCreateId(){
    console.log(this.obj);
    this.submitted = true;

    if(this.AdminCreateIdForm.invalid)
      return;

    this.admin_add_id.userName = this.AdminCreateIdForm.value.userName ?? this.obj.userName;
    this.admin_add_id.password = this.AdminCreateIdForm.value.password;
    this.admin_add_id.sessionUser = this._sessionUser;
    this.admin_add_id.accountRequestId = BigInt(
      resolveAccountRequestId(this.obj as Record<string, unknown>) || 0
    ) as unknown as bigint;
    this.idsservice.AdminAddID(this.admin_add_id).subscribe(resp => {
      console.log(resp);
      this.returnType = resp;
      if(this.returnType['returnStatus'] == 1){
        this.toasterService.success(this.returnType.returnMessage);
        this.bsModalRef.hide();
        window.location.reload();
      }else{
        this.toasterService.warning(this.returnType.returnMessage);
      }
    })

  }

}
