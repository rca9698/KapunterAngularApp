export interface ISiteDetailModal{
    siteId: number,
    siteName: string,
    siteURL: string,
    userId: bigint,
    accountId: bigint,
    userNumber: bigint,
    userName: string,
    documentDetailId: string,
    fileExtenstion: string,
    createdBy: string,
    createdDate: string,
    UpdatedBy: string,
    UpdatedDate: string
}
 
export class SiteDetailModal implements ISiteDetailModal {
    siteId: number;
    siteName: string;
    siteURL: string;
    userId: bigint;
    accountId: bigint;
    userNumber: bigint;
    userName: string;
    documentDetailId: string;
    fileExtenstion: string;
    createdBy: string;
    createdDate: string;
    UpdatedBy: string;
    UpdatedDate: string;

    constructor(siteId: number = 0, siteName: string = '', siteURL: string = '', userId: bigint= 0 as unknown as bigint
    ,accountId: bigint = 0 as unknown as bigint, userNumber: bigint = 0 as unknown as bigint, userName: string = ''
    ,documentDetailId: string = '', fileExtenstion: string = '', createdBy: string = '', createdDate: string = ''
    ,UpdatedBy: string = '', UpdatedDate: string = ''
    ) {
        this.siteId = siteId;
        this.siteName = siteName;
        this.siteURL = siteURL; 
        this.userId = userId;
        this.accountId = accountId;
        this.userNumber = userNumber;
        this.userName = userName;
        this.documentDetailId = documentDetailId;
        this.fileExtenstion = fileExtenstion;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.UpdatedBy = UpdatedBy;
        this.UpdatedDate = UpdatedDate;
      }
    

}