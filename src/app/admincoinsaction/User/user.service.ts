import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Iusers, users } from '../../Shared/Modals/users';
import { apiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {
  returnType: any;
  userdetail: Iusers | undefined;

  constructor(private http:HttpClient, private apiservice: apiService) { }
  
  ngOnInit(): void { }
  userList: Iusers = new users();
   userlist(userQuery:any) {
    return this.apiservice.GetUsers(userQuery);
  }

  deletedUserList(userQuery: any) {
    return this.apiservice.GetUsers({ ...userQuery, isDeleted: 1 });
  }
}
