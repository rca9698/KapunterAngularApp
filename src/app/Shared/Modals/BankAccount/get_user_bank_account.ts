export interface IGetUserBankAccount{
    userId: bigint,
    sessionUser: bigint,
    isActive: number
}

export class GetUserBankAccount implements IGetUserBankAccount{
    userId: bigint;
    sessionUser: bigint;
    isActive: number;
    constructor(userId: bigint = 0 as unknown as bigint
        ,  sessionUser: bigint = 0 as unknown as bigint, isActive: number = 0){
        this.userId = userId;
        this.sessionUser = sessionUser;
        this.isActive = isActive;
    }
}