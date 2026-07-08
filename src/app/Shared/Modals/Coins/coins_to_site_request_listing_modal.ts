export interface Icoins_to_site_request_listing_modal{
    coinsRequestId: string,
    userId: bigint,
    siteId: bigint,
    accountId: bigint,
    accountID?: bigint,
    accountUserName?: string,
    siteName: string,
    siteURL: string,
    coins: bigint,
    totalCoins: bigint,
    coinType : number,
    userNumber: string,
    userName: string,
    coinTypeColor: string,
    documentDetailId: string,
    fileExtenstion: string,
    proofDocumentDetailId: string,
    proofFileExtenstion: string,
    sessionUser: bigint,
    createdBy: string,
    createdDate: string,
    updatedBy: string,
    updatedDate: string,
    totalCount: number,
    paginationCount: number,
    bankId: bigint
}


export class coins_to_site_request_listing_modal implements Icoins_to_site_request_listing_modal {
    coinsRequestId: string;
    userId: bigint;
    siteId: bigint;
    accountId: bigint;
    siteName: string;
    siteURL: string;
    coins: bigint;
    totalCoins: bigint;
    coinType : number;
    userNumber: string;
    userName: string;
    coinTypeColor: string;
    documentDetailId: string;
    fileExtenstion: string;
    proofDocumentDetailId: string;
    proofFileExtenstion: string;
    sessionUser: bigint;
    createdBy: string;
    createdDate: string;
    updatedBy: string;
    updatedDate: string;
    totalCount: number;
    paginationCount: number;
    bankId: bigint

    constructor(coinsRequestId: string = '', userId: bigint= 0 as unknown as bigint, siteId: bigint= 0 as unknown as bigint, accountId: bigint= 0 as unknown as bigint
        , siteName: string = '', siteURL: string = '', coins: bigint = 0 as unknown as bigint
        , totalCoins: bigint = 0 as unknown as bigint, coinType: number , userNumber: string, userName: string = '', coinTypeColor: string
        , documentDetailId: string = '', fileExtenstion: string = '', sessionUser: bigint = 0 as unknown as bigint
        , createdBy: string = '' , createdDate: string = '', UpdatedBy: string = '', UpdatedDate: string = ''
        , totalCount: number = 0, paginationCount: number = 0, proofDocumentDetailId: string = '', proofFileExtenstion: string = ''
        , BankId: bigint
    ) {
        this.coinsRequestId = coinsRequestId; 
        this.userId = userId;
        this.siteName = siteName;
        this.siteId = siteId;
        this.accountId = accountId;
        this.siteURL = siteURL;
        this.coins = coins;
        this.totalCoins = totalCoins;
        this.coinType = coinType;
        this.userNumber = userNumber;
        this.userName = userName;
        this.coinTypeColor = coinTypeColor;
        this.documentDetailId = documentDetailId;
        this.fileExtenstion = fileExtenstion;
        this.sessionUser = sessionUser;
        this.createdBy = createdBy,
        this.createdDate = createdDate,
        this.updatedBy = UpdatedBy,
        this.updatedDate = UpdatedDate,
        this.totalCount = totalCount,
        this.paginationCount = paginationCount,
        this.proofDocumentDetailId = proofDocumentDetailId,
        this.proofFileExtenstion = proofFileExtenstion,
        this.bankId = BankId
      }
}