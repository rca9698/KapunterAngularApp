import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IdsService } from 'src/app/admincoinsaction/Ids/ids.service';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { ISiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';
import { IIDDetailsModal } from 'src/app/Shared/Modals/Ids/id_detail-modal';

@Component({
  selector: 'app-transfer-ids-list-modal',
  templateUrl: './transfer-ids-list-modal.component.html',
  styleUrls: ['./transfer-ids-list-modal.component.css'],
})
export class TransferIdsListModalComponent implements OnInit {
  contextSite?: ISiteDetailModal;

  sitePath = environment.imagePath.sitePath;
  ids: IIDDetailsModal[] = [];
  loading = true;
  returnType: any;

  constructor(
    public bsModalRef: BsModalRef,
    private idsService: IdsService,
    private authservice: AuthService,
    private toasterService: ToastrService
  ) {}

  ngOnInit(): void {
    const uid = this.authservice.user.userId;
    this.idsService.listIds({ userId: uid, sessionUser: uid }).subscribe({
      next: (response) => {
        this.returnType = response;
        this.loading = false;
        if (this.returnType['returnStatus'] == 1) {
          this.ids = this.returnType['returnList'] ?? [];
        } else {
          this.toasterService.warning(this.returnType.returnMessage ?? 'Unable to load IDs');
          this.ids = [];
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.toasterService.warning('Unable to load IDs');
        this.ids = [];
      },
    });
  }

  trackById(_i: number, row: IIDDetailsModal): string {
    return String(row.accountId ?? row.reqId ?? _i);
  }
}
