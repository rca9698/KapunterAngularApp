export interface Ideposit_withdraw_coins_request{
    coinType: number,
    userId: bigint,
    sessionUser: bigint
}

export class deposit_withdraw_coins_request implements Ideposit_withdraw_coins_request{
    coinType: number;
    userId: bigint;
    sessionUser: bigint;

    constructor(coinType: number=0, userId: bigint=0 as unknown as bigint, sessionUser: bigint=0 as unknown as bigint){
        this.coinType = coinType;
        this.userId = userId;
        this.sessionUser = sessionUser;
    }
}

