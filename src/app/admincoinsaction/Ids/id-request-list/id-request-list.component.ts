import { Component } from '@angular/core';
import { IID_Request_Modal } from 'src/app/Shared/Modals/Ids/id-request-modal';
import { IdsService } from '../ids.service';
import { AuthService } from 'src/app/auth.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';

@Component({
  selector: 'app-id-request-list',
  templateUrl: './id-request-list.component.html',
  styleUrls: ['./id-request-list.component.css']
})
export class IdRequestListComponent {
  _sessionUser: bigint;
  constructor(private idsService: IdsService, private authservice: AuthService
    ,private deleteService: DeleteService
  ){ 
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit() {
    this.usersQuery.pageNumber = 1;
    this.usersQuery.userId = this._sessionUser;
    this.usersQuery.sessionUser = this._sessionUser;
    this.fetchIdRequestList(this.usersQuery);
  }

  usersQuery: any = {};
  idRequestList: IID_Request_Modal[] | undefined; 
  returnType:any;
  paginationCount: number = 1;
  totalCount: number = 0;

  CreateIDPopup(obj: IID_Request_Modal){
    this.idsService.AdminAddIDPopup(obj);
  }

  DeleteIDRequest(obj: IID_Request_Modal){
    this.deleteService.OpenDeletePopup('idrequest','ID Request',obj);;
  }

  fetchIdRequestList(paginationQuery: any){
    this.idsService.listIdRequests(paginationQuery).subscribe({
      next:(response) =>{
       this.returnType = response;
       console.log(this.returnType);
       this.idRequestList = this.returnType['returnList'];
       this.paginationCount = this.returnType['paginationCount'];
       this.totalCount = this.returnType['totalCount'];
      },
      error:error => {
        console.log(error);
      }
    });
  }

  
  PaginationNumber(pageNumber:number) {
    this.usersQuery.pageNumber = pageNumber;
    this.usersQuery.userId = this._sessionUser;
    this.usersQuery.sessionUser = this._sessionUser
    this.fetchIdRequestList(this.usersQuery);
  }

  //function to return list of numbers from 0 to n-1 
  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
