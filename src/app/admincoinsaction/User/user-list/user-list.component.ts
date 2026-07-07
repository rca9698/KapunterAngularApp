import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Iusers } from 'src/app/Shared/Modals/users';
import { ReturnType } from 'src/app/Shared/Modals/Common/ReturnType';
import { CoinsService } from '../../coins/coins.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  
  constructor(private userService: UserService, private coinsService: CoinsService
    , private deletemodule: DeleteService){ }

  ngOnInit() {
    this.userlist();
  }

  usersQuery: any ;
  usersList: Iusers[] | undefined; 
  returnType:any;
  paginationCount: number = 1;
  totalCount: number = 0;
  currentPage: number = 0;

  //function to return list of numbers from 0 to n-1 
  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }

  isActivePage(pageNumber: number): boolean {
    return this.currentPage === pageNumber;
  }

  hasNextPage(): boolean {
    return this.currentPage < this.paginationCount - 1;
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }

  fetchUserList(paginationQuery: any){
    this.userService.userlist(paginationQuery).subscribe({
      next:(response) =>{
       this.returnType = response;
       this.usersList = this.returnType['returnList'];
       this.paginationCount = this.returnType['paginationCount'];
       this.totalCount = this.returnType['totalCount'];
       this.currentPage = paginationQuery.pageNumber;
      },
      error:error => {
        console.log(error);
      }
    });
  }

  userlist() {
    this.usersQuery = {
      SessionUser: 1,
      pageNumber: 0
    };
    this.fetchUserList(this.usersQuery);
  }

  depositeCoinsByUserId(user: Iusers){
    this.coinsService.OpenDepositeCoinsByUserIdPopup(user.userNumber);
  }

  withdrawCoinsByUserId(user: Iusers){
    this.coinsService.OpenWithdrawCoinsUserIdPopup(user.userNumber);
  }

  ListCoins(user: Iusers){

  }

  deleteUser(user: Iusers){
    this.deletemodule.OpenDeletePopup('user', 'User', user);
  }

  PaginationNumber(pageNumber:number) {
    // Validate page number
    if (pageNumber < 0 || pageNumber >= this.paginationCount) {
      return;
    }
    this.usersQuery.pageNumber = pageNumber;
    this.fetchUserList(this.usersQuery);
  }

  goToNextPage() {
    if (this.hasNextPage()) {
      this.PaginationNumber(this.currentPage + 1);
    }
  }

  goToPreviousPage() {
    if (this.hasPreviousPage()) {
      this.PaginationNumber(this.currentPage - 1);
    }
  }
}
