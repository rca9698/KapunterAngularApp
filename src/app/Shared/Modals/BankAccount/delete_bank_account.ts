export interface IDeleteBankAccount{
    userId: bigint,
    sessionUser: bigint,
    bankId: bigint
}

export class DeleteBankAccount implements IDeleteBankAccount{
    userId: bigint;
    sessionUser: bigint;
    bankId: bigint;
    constructor(userId: bigint = 0 as unknown as bigint
        ,  sessionUser: bigint = 0 as unknown as bigint, bankId: bigint = 0 as unknown as bigint){
        this.userId = userId;
        this.sessionUser = sessionUser;
        this.bankId = bankId;
    }
}