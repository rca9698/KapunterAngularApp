import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CoinsService } from '../../admincoinsaction/coins/coins.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { AuthService } from 'src/app/auth.service';
import { Ibank_details, bank_details } from 'src/app/Shared/Modals/BankAccount/bank_details';
import { environment } from 'src/environments/environment.production';

@Component({
  selector: 'app-deposite-coins-request',
  templateUrl: './deposite-coins-request.component.html',
  styleUrls: ['./deposite-coins-request.component.css']
})
export class DepositeCoinsRequestComponent {

  title: string | undefined;
  site: any;
  depositeCoinRequestFrom: FormGroup;
   submitted : boolean = false;
   file: File | null = null;
   selectedFileName: string | null = null;
   returnType: any;
   private readonly _sessionUser: bigint;
   adminBankDetail: Ibank_details = new bank_details();
   qrPath: string | undefined;
   
   QRCodeDetail:boolean = false;
   BankTrDetail:boolean = false;
   PhonePeDetail:boolean = false;

   backButtonVisibility: boolean = true;
   depositecoinsproofupload: boolean = false;
   depositecoinsdetails: boolean = true;
   paymentModeListView: boolean = true;
   paymentModeTypesDetailListView: boolean = true;

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private coinsservice: CoinsService, 
    private toasterService: ToastrService, public authservice: AuthService) {
      this.depositeCoinRequestFrom = this.formBuilder.group({
        coins: ['', [Validators.required]]
       },
     )
     this._sessionUser = this.authservice.user.userId;
     this.qrPath = environment.imagePath.QR;
  }

  processFile(imageInput: HTMLInputElement) {
    const f = imageInput.files?.[0];
    this.file = f ?? null;
    this.selectedFileName = f?.name ?? null;
  }

  backToAddCoins(){
    this.depositecoinsdetails = true;
    this.depositecoinsproofupload = false;
  }

  DepositCoinsRequestAmount(){
    this.submitted = true;
  
    if(this.depositeCoinRequestFrom.invalid) {
      return;
    }
    
    this.depositecoinsdetails = false;
    this.depositecoinsproofupload = true;

    this.load_Admin_bankDetail();
  }

  DepositCoinsRequest(){
    if(this.depositeCoinRequestFrom.invalid || !this.file) {
      return;
    }

    let formParams = new FormData();
    formParams.append('File', this.file);
    formParams.append('coins', this.depositeCoinRequestFrom.value["coins"]);
    formParams.append('userid', this._sessionUser.toString());
    formParams.append('sessionuser', this._sessionUser.toString());
    formParams.append('accountId', this.site.accountId);

    console.log(this._sessionUser.toString());

    this.coinsservice.add_coin_to_site_request_insert(formParams).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.bsModalRef.hide();
      },
      error:error => {
        console.log(error);
      }
    });
  }


  downloadQRCode() {
    const imageUrl = `${this.qrPath}${this.adminBankDetail.documentDetailId}.${this.adminBankDetail.fileExtenstion}`;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `qr_code_${this.depositeCoinRequestFrom.value['coins']}.${this.adminBankDetail.fileExtenstion}`;
    link.click();
  }

  PaymentDataView(type: any){
    this.QRCodeDetail = false;
    this.BankTrDetail = false;
    this.PhonePeDetail = false;

    if(type == 'QRCodeDetail'){
      this.QRCodeDetail = true;
    }
    else if(type == 'BankTrDetail'){
      this.BankTrDetail = true;
    }
    else if(type == 'PhonePeDetail'){
      this.PhonePeDetail = true;
    }
  }

  load_Admin_bankDetail(){
    this.coinsservice.get_bank_UPI_details().subscribe({
      next:(response) => {
        this.returnType = response;
        this.adminBankDetail = this.returnType['returnVal'];
        console.log(this.adminBankDetail);
      },
      error: error =>{
        console.log(error);
      }
    })
  }
  
}
