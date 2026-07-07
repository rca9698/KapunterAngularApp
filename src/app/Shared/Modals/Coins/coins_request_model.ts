export interface Icoins_request_model{
    coinsRequestId: string,
    userId: bigint,
    coins: bigint,
    totalCoins: bigint,
    coinType : number,
    userNumber: string,
    userName: string,
    coinTypeColor: string,
    documentDetailId: string,
    fileExtenstion: string,
    sessionUser: bigint,
    createdBy: string,
    createdDate: string,
    updatedBy: string,
    updatedDate: string,
    totalCount: number,
    paginationCount: number
}


export class coins_request_model implements Icoins_request_model {
    coinsRequestId: string;
    userId: bigint;
    coins: bigint;
    totalCoins: bigint;
    coinType : number;
    userNumber: string;
    userName: string;
    coinTypeColor: string;
    documentDetailId: string;
    fileExtenstion: string;
    sessionUser: bigint;
    createdBy: string;
    createdDate: string;
    updatedBy: string;
    updatedDate: string;
    totalCount: number;
    paginationCount: number

    constructor(coinsRequestId: string = '', userId: bigint= 0 as unknown as bigint, coins: bigint = 0 as unknown as bigint
        , totalCoins: bigint = 0 as unknown as bigint, coinType: number , userNumber: string, userName: string = '', coinTypeColor: string
        , documentDetailId: string = '', fileExtenstion: string = '', sessionUser: bigint = 0 as unknown as bigint
        , createdBy: string = '' , createdDate: string = '', UpdatedBy: string = '', UpdatedDate: string = ''
        , totalCount: number = 0, paginationCount: number = 0
    ) {
        this.coinsRequestId = coinsRequestId; 
        this.userId = userId;
        this.coins = coins;
        this.totalCoins = totalCoins;
        this.coinType = coinType;
        this.userNumber = userNumber;
        this.userName = userName;
        this.coinTypeColor = coinTypeColor;
        this.documentDetailId = documentDetailId;
        this.fileExtenstion = fileExtenstion;
        this.sessionUser = sessionUser;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.updatedBy = UpdatedBy;
        this.updatedDate = UpdatedDate;
        this.totalCount = totalCount;
        this.paginationCount = paginationCount;
      }
}