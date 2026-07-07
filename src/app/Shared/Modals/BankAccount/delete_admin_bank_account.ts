export interface IDeleteAdminBankAccount{
    sessionUser: bigint,
    bankId: bigint
}

export class DeleteAdminBankAccount implements IDeleteAdminBankAccount{
    sessionUser: bigint;
    bankId: bigint;
    constructor(sessionUser: bigint = 0 as unknown as bigint, bankId: bigint = 0 as unknown as bigint){
        this.sessionUser = sessionUser;
        this.bankId = bankId;
    }
}