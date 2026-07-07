export interface Iusers{
    userId: bigint,
    firstName: string,
    lastName: string,
    userNumber: string,
    emailId: string,
    claims: string,
    coins: string,
    password: string,
    otp: string,
    sessionUser: bigint,
    createdBy: string,
    createdDate: string,
    updatedBy: string,
    updatedDate: string,
    totalCount: number,
    paginationCount: number
}

export class users{
    userId: bigint;
    firstName: string;
    lastName: string;
    userNumber: string;
    emailId: string;
    claims: string;
    coins: string;
    password: string;
    otp: string;
    sessionUser: bigint;
    createdBy: string;
    createdDate: string;
    updatedBy: string;
    updatedDate: string;
    totalCount: number;
    paginationCount: number;

    constructor(userId: bigint = 0 as unknown as bigint, firstName: string='', lastName: string='', userNumber: string = ''
        , emailId: string='', claims: string='', coins: string='', password: string='', otp: string='', sessionUser: bigint = 0 as unknown as bigint
        , createdBy: string='', createdDate: string='', updatedBy: string='', updatedDate: string = '', totalCount: number = 0
        , paginationCount: number=0
    ){
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.userNumber = userNumber;
        this.emailId = emailId;
        this.claims = claims;
        this.coins = coins;
        this.password = password;
        this.otp = otp;
        this.sessionUser = sessionUser;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.updatedBy = updatedBy;
        this.updatedDate = updatedDate;
        this.totalCount = totalCount;
        this.paginationCount = paginationCount;
    }
}
