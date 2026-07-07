import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-deposite-coins-by-user-id',
  templateUrl: './admin-deposite-coins-by-user-id.component.html',
  styleUrls: ['./admin-deposite-coins-by-user-id.component.css']
})
export class DepositeCoinsByUserIdComponent {
  DepositCoinsByUserIdForm: FormGroup;
  userNumber: string | undefined ;
  submitted = false;

  constructor(public bsModalRef:BsModalRef, private formBuilder: FormBuilder,
    private router:Router, public authservice: AuthService){
      this.DepositCoinsByUserIdForm = this.formBuilder.group({
        coins: ['', [Validators.required]]
       },
     )
 }

 SendDepositCoinsByUserId() {
  this.submitted = true;
  
  if (this.DepositCoinsByUserIdForm?.invalid) {
    return;
  }
  this.bsModalRef.hide();
 }

}
