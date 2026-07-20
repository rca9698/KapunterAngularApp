export interface TransferAccountOption {
  key: string;
  accountId: number;
  siteId: number;
  siteName: string;
  userName: string;
  userNumber: string;
  documentDetailId: string;
  fileExtenstion: string;
}

export interface ITransferIDRequestDetail {
  reqId: number;
  sourceAccountId: number;
  sourceUserName: string;
  targetAccountId: number;
  targetUserName: string;
  userId: number;
  userNumber: string;
  sourceSiteId: number;
  sourceSiteName: string;
  sourceSiteURL: string;
  sourceDocumentDetailId: string;
  sourceFileExtenstion: string;
  targetSiteId: number;
  targetSiteName: string;
  targetSiteURL: string;
  targetDocumentDetailId: string;
  targetFileExtenstion: string;
  transferAmount: number;
  createdDate: string;
  approvedDate?: string;
  isApproved?: boolean;
  isRejected?: boolean;
  rejectionReason?: string;
  statusLabel?: string;
}

export interface IAddTransferIDRequest {
  accountId: number;
  targetAccountId: number;
  targetSiteId: number;
  transferAmount: number;
  sessionUser: number;
}

export interface IConfirmTransferIDRequest {
  reqId: number;
  transferAmount: number;
  sessionUser: number;
}
