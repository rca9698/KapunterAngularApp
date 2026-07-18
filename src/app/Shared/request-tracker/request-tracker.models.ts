export type TrackedRequestKind =
  | 'create-id'
  | 'deposit'
  | 'withdraw'
  | 'close-id';

export type TrackedRequestStatus = 'pending' | 'approved' | 'rejected';

export interface TrackedRequest {
  key: string;
  kind: TrackedRequestKind;
  status: TrackedRequestStatus;
  title: string;
  subtitle?: string;
  amountLabel?: string;
  createdDate?: string;
  detail?: string;
  updatedAt: number;
}
