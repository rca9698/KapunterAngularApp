import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IdsRoutingModule } from './ids-routing.module';
import { IdRequestListComponent } from './id-request-list/id-request-list.component';
import { AdminCreateIdComponent } from './admin-create-id/admin-create-id.component';
import { ListIdsComponent } from './list-ids/list-ids.component';
import { CloseIdRequestsComponent } from './close-id-requests/close-id-requests.component';
import { ChangePasswordRequestsComponent } from './change-password-requests/change-password-requests.component';
import { RejectedIdRequestsComponent } from './rejected-id-requests/rejected-id-requests.component';
import { DeletedIdsListComponent } from './deleted-ids-list/deleted-ids-list.component';
import { DeletedIdRequestListComponent } from './deleted-id-request-list/deleted-id-request-list.component';

@NgModule({
  declarations: [
    IdRequestListComponent,
    AdminCreateIdComponent,
    ListIdsComponent,
    CloseIdRequestsComponent,
    ChangePasswordRequestsComponent,
    RejectedIdRequestsComponent,
    DeletedIdsListComponent,
    DeletedIdRequestListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IdsRoutingModule,
    HttpClientModule,
    ModalModule.forRoot()
  ],
  exports: [
    IdRequestListComponent,
    DeletedIdRequestListComponent,
    DeletedIdsListComponent,
    ListIdsComponent
  ]
})
export class IdsModule { }
