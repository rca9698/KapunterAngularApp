export interface IGetUserById{
    userId: bigint,
    sessionUser: bigint
}

export class GetUserById{
    userId: bigint;
    sessionUser: bigint;
    constructor(userId: bigint = 0 as unknown as bigint,  sessionUser: bigint = 0 as unknown as bigint){
        this.userId = userId;
        this.sessionUser = sessionUser;
    }
}