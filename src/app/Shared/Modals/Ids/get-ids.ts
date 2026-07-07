export interface IGetIDs {
    userId: bigint,
    sessionUser: bigint
}

export class GetIDs {
    userId: bigint;
    sessionUser: bigint;

    constructor(userId: bigint = 0 as unknown as bigint, sessionUser: bigint = 0 as unknown as bigint){ 
        this.userId = userId,
        this.sessionUser = sessionUser
    }

}