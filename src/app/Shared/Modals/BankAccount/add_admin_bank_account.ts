export interface Iadd_admin_bank_account{
    userId: bigint,
    siteId: number,
    bankName: string,
    accountHolderName: string,
    accountNumber: string,
    ifscCode: string,
    upiId: string,
    userName: string,
    sessionUser: bigint
}

export class add_admin_bank_account implements Iadd_admin_bank_account {
    userId: bigint;
    siteId: number;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
    userName: string;
    sessionUser: bigint;
    constructor(userId: bigint = 0 as unknown as bigint, siteId: number = 0, bankName: string = '', accountHolderName: string = ''
        , accountNumber: string = '', ifscCode: string = '', upiId: string = '', userName: string = '', sessionUser: bigint = 0 as unknown as bigint
    ){
        this.userId = userId;
        this.siteId = siteId;
        this.bankName = bankName;
        this.accountHolderName = accountHolderName;
        this.accountNumber = accountNumber;
        this.ifscCode = ifscCode;
        this.upiId = upiId;
        this.userName = userName;
        this.sessionUser = sessionUser;
    }
}
