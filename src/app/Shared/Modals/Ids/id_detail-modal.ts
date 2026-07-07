export interface IIDDetailsModal{
    reqId: bigint,
    userId: bigint,
    accountId: bigint,
    userName: string,
    password: string,
    userNumber: bigint,
    siteName: string,
    siteURL: string,
    siteId: number,
    documentDetailId: string,
    fileExtenstion: string,
    createdBy: string,
    createdDate: string,
    UpdatedBy: string,
    UpdatedDate: string
}
 
export class IDDetailsModal implements IIDDetailsModal {
    reqId: bigint;
    userId: bigint;
    accountId: bigint;
    userNumber: bigint;
    userName: string;
    password: string;
    siteId: number;
    siteName: string;
    siteURL: string;
    documentDetailId: string;
    fileExtenstion: string;
    createdBy: string;
    createdDate: string;
    UpdatedBy: string;
    UpdatedDate: string;

    constructor(reqId: bigint = 0 as unknown as bigint, userId: bigint= 0 as unknown as bigint
        , accountId: bigint, userName: string = '', password: string, siteId: number = 0, siteName: string = '', siteURL: string = ''
    , userNumber: bigint = 0 as unknown as bigint, documentDetailId: string = '', 
    fileExtenstion: string = '', createdBy: string = '', createdDate: string = ''
    ,UpdatedBy: string = '', UpdatedDate: string = ''
    ) {
        this.reqId = reqId;
        this.userId = userId;
        this.accountId = accountId;
        this.userName = userName;
        this.password = password;
        this.siteId = siteId;
        this.siteName = siteName;
        this.siteURL = siteURL;
        this.userNumber = userNumber;
        this.documentDetailId = documentDetailId;
        this.fileExtenstion = fileExtenstion;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.UpdatedBy = UpdatedBy;
        this.UpdatedDate = UpdatedDate;
      }
}