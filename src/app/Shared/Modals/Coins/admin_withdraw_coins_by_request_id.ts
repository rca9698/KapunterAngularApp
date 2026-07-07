export interface Iadmin_withdraw_coins_by_request_id{
    coinsRequestId: string,
    userId: bigint,
    coins: bigint,
    totalCoins: bigint,
    coinType : number,
    userNumber: string,
    sessionUser: bigint
}


export class admin_withdraw_coins_by_request_id implements Iadmin_withdraw_coins_by_request_id {
    coinsRequestId: string;
    userId: bigint;
    coins: bigint;
    totalCoins: bigint;
    coinType : number;
    userNumber: string;
    sessionUser: bigint;

    constructor(coinsRequestId: string = '', userId: bigint = 0 as unknown as bigint, coins: bigint = 0 as unknown as bigint
        , totalCoins: bigint = 0 as unknown as bigint, coinType: number = 0, userNumber: string = ''
        , sessionUser: bigint = 0 as unknown as bigint
    ) {
        this.coinsRequestId = coinsRequestId; 
        this.userId = userId;
        this.coins = coins;
        this.totalCoins = totalCoins;
        this.coinType = coinType;
        this.userNumber = userNumber;
        this.sessionUser = sessionUser;
      }
}