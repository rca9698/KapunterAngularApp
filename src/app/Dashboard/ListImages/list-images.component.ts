import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DashboardService } from '../dashboard.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { DeleteService } from 'src/app/Shared/Modules/delete-module/delete.service';

@Component({
  selector: 'app-list-images',
  templateUrl: './list-images.component.html',
  styleUrls: ['./list-images.component.css']
})
export class ListImagesComponent implements OnInit {
  returnType: any;
  listImage_details: any[] = [];
  dashboardImagesPath: string | undefined;

  constructor(public bsModalRef: BsModalRef, private dashboardService: DashboardService, 
              private toasterService: ToastrService, private deleteService:DeleteService) {
    this.dashboardImagesPath = environment.imagePath.dashboardImages;
  }

  ngOnInit(): void {
    this.list_images();
  }

  list_images() {
    this.dashboardService.list_Images().subscribe({
      next: (response: any) => {
        this.returnType = response;
        console.log(this.returnType);
        this.listImage_details = this.returnType['returnList'] || [];
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  AddSitesPopup() {
    this.dashboardService.OpenAddImagePopup('Upload Dashboard Image');
    // Refresh image list after modal closes
    setTimeout(() => {
      this.list_images();
    }, 1000);
  }

  setDefault(imageId: any) {
    console.log('Set default image:', imageId);
    this.dashboardService.setDefaultImage(imageId).subscribe({
      next: (response: any) => {
        this.toasterService.success('Image set as default successfully');
        this.list_images();
      },
      error: (error: any) => {
        console.log(error);
        this.toasterService.error('Failed to set default image');
      }
    });
  }

deleteImagePopup(imageId: any){
  console.log(imageId);
    this.deleteService.OpenDeletePopup('dashboardImage','Image',imageId);
  }

  deleteImage(imageId: any) {
    if (confirm('Are you sure you want to delete this image?')) {
      this.dashboardService.deleteImage(imageId).subscribe({
        next: (response) => {
          this.toasterService.success('Image deleted successfully');
          this.list_images();
        },
        error: (error) => {
          console.log(error);
          this.toasterService.error('Failed to delete image');
        }
      });
    }
  }

  downloadQAImage() {
    this.dashboardService.downloadDepositQAImage().subscribe({
      next: (blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'deposit_qa_template.jpeg';
        link.click();
        URL.revokeObjectURL(link.href);
      },
      error: (error: any) => {
        console.log(error);
        this.toasterService.error('Failed to download QA image');
      }
    });
  }

}
