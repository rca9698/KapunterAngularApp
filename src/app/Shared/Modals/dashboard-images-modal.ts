export interface IDashboardImages{
    documentDetailId: string,
    fileExtenstion: string,
    displayDate: string
}


export class DashboardImages implements IDashboardImages {

    documentDetailId: string;
    fileExtenstion: string;
    displayDate: string;

    constructor(DocumentDetailId: string = '', FileExtenstion: string = '', DisplayDate: string = ''
    ) {
        this.documentDetailId = DocumentDetailId;
        this.fileExtenstion = FileExtenstion;
        this.displayDate = DisplayDate;
      }
}