export interface IAddUpdateAdminUpiAccount{
    upiDetailID: bigint,
    userName: string,
    upiId: string,
    sessionUser: bigint
}

export class AddUpdateAdminUpiAccount implements IAddUpdateAdminUpiAccount{
    upiDetailID: bigint;
    userName: string;
    upiId: string;
    sessionUser: bigint;
    constructor(upiDetailID: bigint = 0 as unknown as bigint, userName: string = ''
        , upiId: string = '', sessionUser: bigint = 0 as unknown as bigint
    ){
        this.upiDetailID = upiDetailID,
        this.userName = userName,
        this.upiId = upiId,
        this.sessionUser = sessionUser
    }
}