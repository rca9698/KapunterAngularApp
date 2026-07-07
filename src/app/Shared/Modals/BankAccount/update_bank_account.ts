export interface IUpdateBankAccount{
    userId: bigint,
    bankName: string,
    accountHolderName: string,
    accountNumber: string,
    ifscCode: string,
    sessionUser: bigint
}

export class UpdateBankAccount implements IUpdateBankAccount{
    userId: bigint;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    sessionUser: bigint;

    constructor(userId: bigint = 0 as unknown as bigint, bankName: string = '', accountHolderName: string = ''
        , accountNumber: string = '', ifscCode: string = '', sessionUser: bigint = 0 as unknown as bigint
    ){
        this.userId = userId,
        this.bankName = bankName,
        this.accountHolderName = accountHolderName,
        this.accountNumber = accountNumber,
        this.ifscCode = ifscCode,
        this.sessionUser = sessionUser
    }
}

