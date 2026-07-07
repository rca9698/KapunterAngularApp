export interface ITokenusermodal{
    userid: bigint,
    otp: string,
    role: string
}

export interface Iusermodal{
    userId: bigint,
    otp: string,
    role: string
}

export class usermodal{
    userId: bigint;
    otp: string;
    role: string;

    constructor(userId: bigint = 0 as unknown as bigint, otp: string = '', role: string = ''){
        this.userId = userId,
        this.otp = otp,
        this.role = role
    }
}