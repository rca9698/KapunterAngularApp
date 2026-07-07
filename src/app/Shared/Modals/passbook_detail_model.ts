export interface Ipassbook_detail_model{
    userId: bigint;
    siteId: number;
    activityId: number;
    passbookHistoryId: string;
    activityDescription: string;
    siteName: string;
    siteURL: string;
    siteUserName: string;
    documentDetailId: string;
    fileExtenstion: string;
    proofDocumentDetailID: string;
    proofFileExtenstion: string;
    userName: string;
    password: string;
    coins: number;
    createdDate: string;
    approvedDate: string;
    trxStatus: string;
    trxColor: string;
    displayCoins: string;
}

export class passbook_detail_model implements Ipassbook_detail_model{
    userId: bigint;
    siteId: number;
    activityId: number;
    passbookHistoryId: string;
    activityDescription: string;
    siteName: string;
    siteURL: string;
    siteUserName: string;
    documentDetailId: string;
    fileExtenstion: string;
    proofDocumentDetailID: string;
    proofFileExtenstion: string;
    userName: string;
    password: string;
    coins: number;
    createdDate: string;
    approvedDate: string;
    trxStatus: string;
    trxColor: string;
    displayCoins: string;
    constructor(userId: bigint = 0 as unknown as bigint, siteId: number = 0, activityId: number = 0
        , passbookHistoryId: string = '', activityDescription: string = '', siteName: string = ''
        , siteURL: string = '', siteUserName: string = '',  documentDetailId: string = '', fileExtenstion: string = ''
        , proofDocumentDetailID: string= '', proofFileExtenstion: string = '',  userName: string= ''
        , password: string = '', coins: number = 0, createdDate: string = '', approvedDate: string =''
        , trxStatus: string = '', trxColor: string = '', displayCoins: string = ''
        , 
    ){
        this.userId = userId;
        this.siteId = siteId;
        this.activityId = activityId;
        this.passbookHistoryId = passbookHistoryId;
        this.activityDescription = activityDescription;
        this.siteName = siteName;
        this.siteURL = siteURL;
        this.siteUserName = siteUserName;
        this.documentDetailId = documentDetailId;
        this.fileExtenstion = fileExtenstion;
        this.proofDocumentDetailID = proofDocumentDetailID;
        this.proofFileExtenstion = proofFileExtenstion;
        this.userName = userName;
        this.password = password;
        this.coins = coins;
        this.createdDate = createdDate;
        this.approvedDate = approvedDate;
        this.trxStatus = trxStatus;
        this.trxColor = trxColor;
        this.displayCoins = displayCoins;
    }

}