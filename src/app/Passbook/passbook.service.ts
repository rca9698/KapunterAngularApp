import { Injectable } from '@angular/core';
import { apiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PassbookService {

  constructor(private apiservice: apiService) { }

  passbookHistorylist(obj: any){
    return this.apiservice.GetPassbookHistory(obj);
  }

  passbookHistorybyid(obj: any){
    return this.apiservice.GetPassbookHistoryById(obj);
  }


}
