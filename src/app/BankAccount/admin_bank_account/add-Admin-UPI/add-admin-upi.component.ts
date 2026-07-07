import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BankAccountService } from '../../bank-account.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { Router } from '@angular/router';
import { Iadd_admin_bank_account, add_admin_bank_account } from 'src/app/Shared/Modals/BankAccount/add_admin_bank_account';
import { CommonService } from 'src/app/common.service';

@Component({
  selector: 'app-add-admin-upi',
  templateUrl: './add-admin-upi.component.html',
  styleUrls: ['./add-admin-upi.component.css']
})
export class AddAdminUPIComponent {
  submitted : boolean = false;
  addAdminUpiForm: FormGroup;
  add_admin_upi: Iadd_admin_bank_account = new add_admin_bank_account();
  returnType: any;

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private bankAccountService: BankAccountService, 
    private toasterService: ToastrService, private authservice: AuthService,
    private commonService: CommonService){ 
      this.addAdminUpiForm = this.formBuilder.group({
        UpiName: ['', [Validators.required]],
        UpiId: ['', [Validators.required]], 
       },
     )
    }

    AddAdminUpi() {
      this.submitted = true;

      if(this.addAdminUpiForm.invalid) {
        return;
      }

      this.add_admin_upi.userId = this.authservice.user.userId;
      this.add_admin_upi.sessionUser = this.authservice.user.userId;
      this.bankAccountService.add_update_admin_upi(this.add_admin_upi).subscribe(resp => {
        this.returnType = resp;
        this.commonService.toastrMessages(this.returnType);
      });

    }
}
