export interface IAddIDRequest{
    UserId: bigint,
    siteid: number,
    userName:  String
    sessionUser: bigint
}

export class AddIDRequest implements IAddIDRequest{
    UserId: bigint;
    siteid: number;
    userName: String;
    sessionUser: bigint;
    constructor(userId: bigint = 0 as unknown as bigint , siteid: number =0, userName:  String='', sessionUser: bigint = 0 as unknown as bigint){
        this.UserId = userId;
        this.siteid = siteid;
        this.userName = userName;
        this.sessionUser = sessionUser
    }
    
}