import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BankAccountService } from '../../bank-account.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { Router } from '@angular/router';
import { Iadd_bank_account, add_bank_account } from 'src/app/Shared/Modals/BankAccount/add_bank_account';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-add-user-bank-account',
  templateUrl: './add-user-bank-account.component.html',
  styleUrls: ['./add-user-bank-account.component.css']
})
export class AddUserBankAccountComponent {
  submitted : boolean = false;
  add_User_Bank_AccountForm: FormGroup;
  add_user_bank_account: Iadd_bank_account = new add_bank_account();
  returnType: any;

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private bankAccountService: BankAccountService, 
    private toasterService: ToastrService, private authservice: AuthService){ 
      this.add_User_Bank_AccountForm = this.formBuilder.group({
        BName: ['', [Validators.required]],
        ANumber: ['', [Validators.required]],
        AHName: ['', [Validators.required]],
        IFSCCode: ['', [Validators.required]]
       },
     )
    }


    Add_User_Bank_Account(){
      this.submitted = true;

      if(this.add_User_Bank_AccountForm.invalid) {
        return;
      }

      this.add_user_bank_account.userId = this.authservice.user.userId;
      this.add_user_bank_account.sessionUser = this.authservice.user.userId;
 
      this.bankAccountService.Add_Bank_Account(this.add_user_bank_account).subscribe(resp => {
        this.returnType = resp;
        if(this.returnType['returnStatus'] == 1){
          this.toasterService.success(this.returnType.returnMessage);
          this.bsModalRef.hide();
          this.router.navigate(['/bankAccount/list-user-bank-account']);
        } else {
          this.toasterService.warning(this.returnType.returnMessage);
        }
      });
    }

}
