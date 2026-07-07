import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { BankAccountService } from '../../bank-account.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { AuthService } from 'src/app/auth.service';
import { add_user_upi, Iadd_user_upi } from 'src/app/Shared/Modals/BankAccount/add_user_upi';

@Component({
  selector: 'app-add-user-upi',
  templateUrl: './add-user-upi.component.html',
  styleUrls: ['./add-user-upi.component.css']
})
export class AddUserUpiComponent {
  submitted = false;
  addUserUpiForm: FormGroup;
  add_user_upi: Iadd_user_upi = new add_user_upi();
  returnType: any;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private router: Router,
    private bankAccountService: BankAccountService,
    private toasterService: ToastrService,
    private authservice: AuthService
  ) {
    this.addUserUpiForm = this.formBuilder.group({
      UpiName: ['', [Validators.required]],
      UpiId: ['', [Validators.required]]
    });
  }

  Add_User_Upi() {
    this.submitted = true;

    if (this.addUserUpiForm.invalid) {
      return;
    }

    this.add_user_upi.userId = this.authservice.user.userId;
    this.add_user_upi.sessionUser = this.authservice.user.userId;

    this.bankAccountService.Add_User_Upi(this.add_user_upi).subscribe(resp => {
      this.returnType = resp;
      if (this.returnType['returnStatus'] == 1) {
        this.toasterService.success(this.returnType.returnMessage);
        this.bsModalRef.hide();
        this.router.navigate(['/bankAccount/list-user-bank-account']);
      } else {
        this.toasterService.warning(this.returnType.returnMessage);
      }
    });
  }
}
