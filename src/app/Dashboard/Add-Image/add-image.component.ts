import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DashboardService } from '../dashboard.service';
import { ToastrService } from 'src/app/toastr/toastr.service';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/common.service';

@Component({
  selector: 'app-add-image',
  templateUrl: './add-image.component.html',
  styleUrls: ['./add-image.component.css']
})
export class AddImageComponent {
    title: string | undefined;
    AddImageForm: FormGroup;
    submitted : boolean = false;
    file: File | null = null;
    selectedFileName: string | null = null;
    isupdate: boolean = false;
    returnType: any;

    constructor(public bsModalRef:BsModalRef, private formBuilder: FormBuilder,
      private router:Router, private dashboardService: DashboardService, 
      private toasterService: ToastrService, private commonService: CommonService){
        this.AddImageForm = this.formBuilder.group({
          date: ['', [Validators.required]],
          files: ['', [Validators.required]]
         },
       )
    }

    processFile(imageInput: HTMLInputElement) {
      const f = imageInput.files?.[0];
      this.file = f ?? null;
      this.selectedFileName = f?.name ?? null;
      this.AddImageForm.patchValue({ files: f ? f.name : '' });
    }

    AddDashboardImage(){
      this.submitted = true;
      if(this.AddImageForm.invalid || !this.file) {
        return;
      }
    
      let formParams = new FormData();
      formParams.append('File', this.file);
      formParams.append('date', this.AddImageForm.value["date"]);
      
      this.dashboardService.add_dashbord_image(formParams).subscribe(resp => {
        this.returnType = resp;
        this.commonService.toastrMessages(this.returnType);
      })
    }

}
