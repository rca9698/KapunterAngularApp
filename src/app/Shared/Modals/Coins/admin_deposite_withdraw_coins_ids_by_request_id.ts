export interface Iadmin_deposite_withdraw_coins_ids_by_request_id{
    coinsRequestId: string,
    userId: bigint,
    siteId: bigint,
    accountId: bigint,
    coins: bigint,
    totalCoins: bigint,
    coinType : number,
    userNumber: string,
    sessionUser: bigint,
    utr?: string
}


export class admin_deposite_withdraw_coins_ids_by_request_id implements Iadmin_deposite_withdraw_coins_ids_by_request_id {
    coinsRequestId: string;
    siteId: bigint;
    userId: bigint;
    coins: bigint;
    totalCoins: bigint;
    coinType : number;
    userNumber: string;
    sessionUser: bigint;
    accountId: bigint;
    utr?: string;

    constructor(coinsRequestId: string = '', userId: bigint = 0 as unknown as bigint, siteId: bigint = 0 as unknown as bigint, coins: bigint = 0 as unknown as bigint
        , totalCoins: bigint = 0 as unknown as bigint, coinType: number = 0, userNumber: string = ''
        , sessionUser: bigint = 0 as unknown as bigint, accountId: bigint = 0 as unknown as bigint
        , utr: string = ''
    ) {
        this.coinsRequestId = coinsRequestId; 
        this.siteId = siteId;
        this.userId = userId;
        this.coins = coins;
        this.totalCoins = totalCoins;
        this.coinType = coinType;
        this.userNumber = userNumber;
        this.sessionUser = sessionUser;
        this.accountId = accountId;
        this.utr = utr;
      }
}
