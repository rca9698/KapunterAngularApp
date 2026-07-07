import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SitesService } from '../sites.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { ISiteDetailModal, SiteDetailModal } from 'src/app/Shared/Modals/site-detail-modal';

@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.component.html',
  styleUrls: ['./add-site.component.css']
})
export class AddSiteComponent implements OnInit {
   AddSiteFrom: FormGroup;
   submitted : boolean = false;
   file: File | null = null;
   selectedFileName: string | null = null;
   isupdate: boolean = false;
   site: ISiteDetailModal = new SiteDetailModal();
   returnType: any;
  
   @ViewChild('imageInput') fileInput: any

  processFile(imageInput: HTMLInputElement) {
    const f = imageInput.files?.[0];
    this.file = f ?? null;
    this.selectedFileName = f?.name ?? null;
  }

  constructor(public bsModalRef:BsModalRef, private formBuilder:FormBuilder, 
    private router:Router, private sitesService: SitesService, 
    private toasterService: ToastrService){
      this.AddSiteFrom = this.formBuilder.group({
        siteName: ['', [Validators.required]],
        siteURL: ['', [Validators.required]],
        
       },
     )
  }
  ngOnInit(): void {
    
  }

  AddSite(){
    this.submitted = true;
    
  if(this.AddSiteFrom.invalid || !this.file) {
    return;
  }

  console.log(this.site);

  let formParams = new FormData();
  formParams.append('File', this.file);
  formParams.append('SiteId',  this.site.siteId?.toString());
  formParams.append('SiteName', this.site.siteName);
  formParams.append('SiteURL', this.site.siteURL);

    this.sitesService.uploadfile(formParams).subscribe(resp => {
      console.log(resp);
      this.returnType = resp;
      if(this.returnType['returnStatus'] == 1){
        this.toasterService.success(this.returnType.returnMessage);
        this.bsModalRef.hide();
        this.router.navigate(['/site/list-sites']);
      }else{
        this.toasterService.warning(this.returnType.returnMessage);
      }
    })
  }

}
