export interface Iupdate_coins_to_ids_request_modal{
    siteId: bigint,
    accountId: bigint,
    userId: bigint,
    coins: bigint,
    coinType : number,
    sessionUser: bigint
}


export class update_coins_to_ids_request_modal implements Iupdate_coins_to_ids_request_modal {
    siteId: bigint;
    accountId: bigint;
    userId: bigint;
    coins: bigint;
    coinType : number;
    sessionUser: bigint;

    constructor(siteId: bigint = 0 as unknown as bigint, accountId: bigint = 0 as unknown as bigint
        , userId: bigint = 0 as unknown as bigint , coins: bigint = 0 as unknown as bigint
        , coinType : number = 0, sessionUser: bigint = 0 as unknown as bigint
    ) {
         this.siteId = siteId;
         this.accountId = accountId;
         this.userId = userId;
         this.coinType = coinType;
         this.coins = coins;
         this.sessionUser = sessionUser;
      }
}