import { Component } from '@angular/core';
import { IDDetailsModal } from 'src/app/Shared/Modals/Ids/id_detail-modal';
import { IdsService } from '../ids.service';

@Component({
  selector: 'app-ids-list',
  templateUrl: './ids-list.component.html',
  styleUrls: ['./ids-list.component.css']
})
export class IdsListComponent {
  constructor(private idsService: IdsService){ }

  ngOnInit() {
     
  }


  usersQuery: any ;
  idRequestList: IDDetailsModal[] | undefined; 
  returnType:any;
  paginationCount: number = 1;
  totalCount: number = 0;
  
  
  DeleteID(obj: IDDetailsModal){
    
  }

  fetchIdList(paginationQuery: any){
    this.idsService.listIds(paginationQuery).subscribe({
      next:(response) =>{
       this.returnType = response;
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
    this.fetchIdList(this.usersQuery);
  }

  //function to return list of numbers from 0 to n-1 
  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }

}
