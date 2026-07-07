export interface Iadd_user_upi {
    userId: bigint;
    sessionUser: bigint;
    upiId: string;
    userName: string;
}

export class add_user_upi implements Iadd_user_upi {
    userId: bigint;
    sessionUser: bigint;
    upiId: string;
    userName: string;

    constructor(
        userId: bigint = 0 as unknown as bigint,
        sessionUser: bigint = 0 as unknown as bigint,
        upiId: string = '',
        userName: string = ''
    ) {
        this.userId = userId;
        this.sessionUser = sessionUser;
        this.upiId = upiId;
        this.userName = userName;
    }
}
