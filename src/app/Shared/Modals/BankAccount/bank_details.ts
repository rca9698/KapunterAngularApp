export interface Ibank_details{
    bankAccountDetailID: bigint,
    userId: BigInt,
    siteId: number,
    bankName: string,
    accountHolderName: string,
    accountNumber: string,
    ifscCode: string,
    upiId: string,
    qrId: bigint,
    qrPath: string,
    documentDetailId: string,
    fileExtenstion: string,
    isDefault: string,
    accountDisplayName: string,
    createdBy: string,
    createdDate: string,
    updatedBy: string,
    updatedDate: string,
    totalCount: number,
    paginationCount: number
}

export class bank_details implements Ibank_details{
    bankAccountDetailID: bigint;
    userId: BigInt;
    siteId: number;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
    qrId: bigint;
    qrPath: string;
    documentDetailId: string;
    fileExtenstion: string;
    isDefault: string;
    accountDisplayName: string;
    createdBy: string;
    createdDate: string;
    updatedBy: string;
    updatedDate: string;
    totalCount: number;
    paginationCount: number;

    constructor(bankAccountDetailID: bigint = 0 as unknown as bigint, userId: BigInt = 0 as unknown as bigint
        , siteId: number = 0
        , bankName: string = '', accountHolderName: string = '', accountNumber: string = ''
        , ifscCode: string = '', upiId: string = ''
        , qrId: bigint = 0 as unknown as bigint, qrPath: string = ''
        , documentDetailId: string ='', fileExtenstion: string = '', isDefault: string = ''
        , accountDisplayName: string = '', createdBy: string ='', createdDate: string = ''
        , updatedBy: string = '', updatedDate: string = '', totalCount: number = 0, paginationCount: number = 0
    ) {
        this.bankAccountDetailID = bankAccountDetailID;
        this.userId = userId;
        this.siteId = siteId;
        this.bankName = bankName;
        this.accountHolderName = accountHolderName;
        this.accountNumber = accountNumber;
        this.ifscCode = ifscCode;
        this.upiId = upiId;
        this.qrId = qrId;
        this.qrPath = qrPath;
        this.documentDetailId = documentDetailId;
        this.fileExtenstion = fileExtenstion;
        this.isDefault = isDefault;
        this.accountDisplayName =accountDisplayName;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.updatedBy = updatedBy;
        this.updatedDate = updatedDate;
        this.totalCount = totalCount;
        this.paginationCount = paginationCount;
    }
}
