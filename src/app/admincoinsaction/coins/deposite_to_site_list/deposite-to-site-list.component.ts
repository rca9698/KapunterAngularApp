import { Component, OnInit } from '@angular/core';
import { CoinsService } from '../coins.service';
import { Icoins_to_site_request_listing_modal } from 'src/app/Shared/Modals/Coins/coins_to_site_request_listing_modal';
import { AuthService } from 'src/app/auth.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';
import { ViewImageService } from 'src/app/Shared/Modules/view-image-module/view-image.service';
import { environment } from 'src/environments/environment';
import { resolveAccountId } from '../coins-request.util';

@Component({
  selector: 'app-deposite-to-site-list',
  templateUrl: './deposite-to-site-list.component.html',
  styleUrls: ['./deposite-to-site-list.component.css', '../coins-listing.shared.css']
})
export class DepositeToSiteListComponent implements OnInit {
  requestList: Icoins_to_site_request_listing_modal[] | undefined;
  returnType: any;
  paginationCount: number = 1;
  totalCount: number = 0;
  sitePath = environment.imagePath.sitePath;
  private readonly _sessionUser: bigint;

  constructor(
    private coinsservice: CoinsService,
    private authservice: AuthService,
    private toasterService: ToastrService,
    private deleteservice: DeleteService,
    private viewimageservice: ViewImageService
  ) {
    this._sessionUser = this.authservice.user.userId;
  }

  ngOnInit(): void {
    this.deposite_to_site_list();
  }

  deposite_to_site_list() {
    // Previous listing call: GET /api/Coin/GetCoinsToAccountRequest/{coinType}/{sessionUser}
    this.coinsservice.deposit_to_site_list(1, this._sessionUser).subscribe(resp => {
      this.returnType = resp;
      if (this.returnType['returnStatus'] == 1) {
        this.requestList = this.returnType['returnList'];
        if (this.requestList?.length) {
          this.paginationCount = this.requestList[0].paginationCount || 1;
          this.totalCount = this.requestList[0].totalCount || this.requestList.length;
        }
      } else {
        this.toasterService.warning(this.returnType.returnMessage);
      }
    });
  }

  getAccountId(request: Icoins_to_site_request_listing_modal): string {
    return String(resolveAccountId(request as unknown as Record<string, unknown>));
  }

  getAccountLabel(request: Icoins_to_site_request_listing_modal): string {
    return request.accountUserName || request.userName || this.getAccountId(request);
  }

  DepositeCoinsToAccountPopup(obj: Icoins_to_site_request_listing_modal) {
    this.coinsservice.OpenAdminDepositeCoinsToIdRequestIdPopup(obj);
  }

  ViewCoinRequestProof(obj: Icoins_to_site_request_listing_modal) {
    this.viewimageservice.OpenViewImagePopup('proof', '', obj);
  }

  DeleteCoinsToAccountRequestPopup(obj: Icoins_to_site_request_listing_modal) {
    this.deleteservice.OpenDeletePopup('deletecoinfromIdRequest', 'Delete deposit request', obj);
  }

  PaginationNumber(pageNumber: number) {}

  getCountArray(): number[] {
    return Array.from({ length: this.paginationCount }, (_, i) => i);
  }
}
