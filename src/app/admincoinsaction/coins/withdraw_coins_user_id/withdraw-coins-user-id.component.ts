import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-withdraw-coins-user-id',
  templateUrl: './withdraw-coins-user-id.component.html',
  styleUrls: ['./withdraw-coins-user-id.component.css']
})
export class WithdrawCoinsUserIdComponent {
  obj: any;

  WithdrawCoinsUserIdForm: FormGroup;
  userNumber: string | undefined ;
  submitted = false;

  constructor(public bsModalRef:BsModalRef, private formBuilder: FormBuilder,
    private router:Router, public authservice: AuthService){
      this.WithdrawCoinsUserIdForm = this.formBuilder.group({
        coins: ['', [Validators.required]]
       },
     )
 }

 SendWithdrawCoinsUserId(){
  this.submitted = true;
  
  if (this.WithdrawCoinsUserIdForm?.invalid) {
    return;
  }
  this.bsModalRef.hide();
 }

 }
