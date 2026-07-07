import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { apiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient, private apiservice: apiService) { }

  getDashboradImages(){
    return this.apiservice.GetDashboardImages();
  }

}
