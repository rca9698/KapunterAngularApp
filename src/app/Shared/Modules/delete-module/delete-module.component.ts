import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SitesService } from 'src/app/Sites/sites.service';
import { apiService } from 'src/app/api.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { DeleteAdminBankAccount } from '../../Modals/BankAccount/delete_admin_bank_account';
import { AuthService } from 'src/app/auth.service';
import { DeleteBankAccount } from '../../Modals/BankAccount/delete_bank_account';
import { BankAccountService } from 'src/app/BankAccount/bank-account.service';
import { resolveAccountRequestId } from 'src/app/admincoinsaction/shared/id-request.util';
import { PageRefreshService } from 'src/app/Shared/Utils/page-refresh.service';

@Component({
  selector: 'app-delete-module',
  templateUrl: './delete-module.component.html',
  styleUrls: ['./delete-module.component.css']
})
export class DeleteModuleComponent {
  deleteType: string = '';
  title: string = ''
  obj: any;
  deletionReason = '';
  deletionReasonTouched = false;
  readonly maxDeletionReasonLength = 200;

  returnType: any;
  returnValue: any;
  returnStatus: any;

  constructor(public bsModalRef:BsModalRef, 
    private router:Router, private toasterService: ToastrService, private apiservices:apiService
  , private authService: AuthService, private bankAccountService: BankAccountService
  , private pageRefresh: PageRefreshService){
      
  }



  get requiresDeletionReason(): boolean {
    return this.deleteType === 'idrequest';
  }

  get remainingChars(): number {
    return this.maxDeletionReasonLength - (this.deletionReason?.length ?? 0);
  }

  onDeletionReasonInput(): void {
    this.deletionReasonTouched = true;
  }

  deleteData(){
    switch(this.deleteType){
      case 'site':
        this.SiteDelete();
        break;
      case 'user':
        this.UserDelete();
        break;
      case 'adminbank':
        this.AdminBankAccountDelete();
        break;
      case 'adminupi':
        this.AdminUpiDelete();
        break;
      case 'adminqr':
        this.AdminQRDelete();
        break;
      case 'userbank':
        this.BankAccountDelete();
        break;
      case 'userupi':
        this.UserUpiDelete();
        break;
      case 'userqr':
        this.UserQRDelete();
        break;
      case 'idrequest':
        this.IDRequestDelete();
        break;
      case 'id':
        this.IDDelete();
        break;
      case 'deposittowallet':
        this.DeleteDepositWalletRequest();
        break;
      case 'withdrawwalletrequest':
        this.DeleteWithdrawWalletRequest();
        break;
      case 'deletecoinfromIdRequest':
        this.DeleteCoinsRequestToId();
        break;
      case 'withdrawfromidrequest':
        this.DeleteWithdrawFromIdRequest();
        break;
        case 'dashboardImage':
        this.DeleteDashboardImages();
        break;
    }
  }

  SiteDelete(){
    this.apiservices.DeleteSite(this.obj).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  UserDelete(){
    this.apiservices.DeleteUser(this.obj).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  IDDelete(){
    this.apiservices.DeleteID(this.obj).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  IDRequestDelete(){
    this.deletionReasonTouched = true;
    const reason = this.deletionReason?.trim() ?? '';
    if (!reason) {
      this.toasterService.warning('Please provide a deletion reason.');
      return;
    }

    const requestId = resolveAccountRequestId(this.obj as Record<string, unknown>);
    const payload = {
      accountrequestId: Number(requestId),
      sessionUser: this.authService.user.userId,
      deletionReason: reason.slice(0, this.maxDeletionReasonLength)
    };

    this.apiservices.DeleteIDRequest(payload).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  DeleteDepositWalletRequest(){
    this.apiservices.DeleteRequestCoins(this.buildCoinDeletePayload()).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  DeleteWithdrawWalletRequest(){
    this.apiservices.DeleteRequestCoins(this.buildCoinDeletePayload()).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  DeleteCoinsRequestToId(){
    this.apiservices.DeleteCoinsRequestToId(this.buildCoinDeletePayload()).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  DeleteWithdrawFromIdRequest(){
    this.apiservices.DeleteCoinsRequestToId(this.buildCoinDeletePayload()).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  private buildCoinDeletePayload(){
    return {
      coinRequestId: this.obj.coinsRequestId,
      sessionUser: this.authService.user.userId
    };
  }


  DashboardImagesDelete(){
    this.apiservices.DeleteDashboardImages(this.obj).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  BankAccountDelete(){
    const deleteObj = new DeleteBankAccount();
    deleteObj.bankId = this.obj.bankAccountDetailID;
    deleteObj.userId = this.authService.user.userId;
    deleteObj.sessionUser = this.authService.user.userId;
    this.apiservices.DeleteBankAccount(deleteObj).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  UserUpiDelete(){
    this.bankAccountService.Delete_User_Upi(this.obj.bankAccountDetailID).subscribe(resp => {
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  UserQRDelete(){
    this.bankAccountService.Delete_User_QR(this.obj.qrId ?? this.obj.bankAccountDetailID).subscribe(resp => {
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  AdminBankAccountDelete(){
    const deleteObj = new DeleteAdminBankAccount();
    deleteObj.bankId = this.obj.bankAccountDetailID;
    deleteObj.sessionUser = this.authService.user.userId;
    this.apiservices.DeleteAdminBankAccount(deleteObj).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  AdminUpiDelete(){
    this.apiservices.DeleteAdminUpiAccount(this.authService.user.userId, this.obj.bankAccountDetailID).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  AdminQRDelete(){
    const qrId = this.obj.qrId ?? this.obj.bankAccountDetailID;
    this.apiservices.DeleteAdminqrAccount(this.authService.user.userId, qrId).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }
  
   DeleteDashboardImages(){
    console.log(this.obj);
    this.apiservices.DeleteDashboardImages(this.obj).subscribe(resp=>{
      this.returnType = resp;
      this.toastrMessages();
    });
  }

  toastrMessages(){
    this.returnStatus = this.returnType['returnStatus']; 
    if(this.returnStatus == 1){
      this.toasterService.success(this.returnType['returnMessage']);
    }else{
      this.toasterService.warning(this.returnType['returnMessage']);
    }
    this.bsModalRef.hide();

    this.pageRefresh.refreshCurrentRoute();
  }

}
