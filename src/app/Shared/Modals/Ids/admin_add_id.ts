export interface Iadmin_add_id{
    accountRequestId: bigint,
    userName:  string,
    password: string,
    sessionUser: bigint
}

export class admin_add_id implements Iadmin_add_id{
    accountRequestId: bigint;
    userName: string;
    password:  string;
    sessionUser: bigint;
    constructor(accountRequestId: bigint = 0 as unknown as bigint , userName:  string = ''
        , password:  string = '', sessionUser: bigint = 0 as unknown as bigint){
        this.accountRequestId = accountRequestId;
        this.password = password;
        this.userName = userName;
        this.sessionUser = sessionUser
    }
    
}