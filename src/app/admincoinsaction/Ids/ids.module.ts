import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { TransferIdRequestsComponent } from './transfer-id-requests/transfer-id-requests.component';
import { TransferIdHistoryComponent } from './transfer-id-history/transfer-id-history.component';
import { ApproveTransferIdModalComponent } from './approve-transfer-id-modal/approve-transfer-id-modal.component';
import { LoaderModule } from 'src/app/Shared/loader/loader.module';
import { SingleClickModule } from 'src/app/Shared/single-click/single-click.module';

@NgModule({
  declarations: [
    IdRequestListComponent,
    AdminCreateIdComponent,
    ListIdsComponent,
    CloseIdRequestsComponent,
    ChangePasswordRequestsComponent,
    RejectedIdRequestsComponent,
    DeletedIdsListComponent,
    DeletedIdRequestListComponent,
    TransferIdRequestsComponent,
    TransferIdHistoryComponent,
    ApproveTransferIdModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IdsRoutingModule,
    HttpClientModule,
    ModalModule.forRoot(),
    LoaderModule,
    SingleClickModule
  ],
  exports: [
    IdRequestListComponent,
    DeletedIdRequestListComponent,
    DeletedIdsListComponent,
    ListIdsComponent
  ]
})
export class IdsModule { }
