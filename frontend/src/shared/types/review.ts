export interface TextRange {
  start: number;
  end: number;
}

export interface Sender {
  id: string;
  nickname: string;
}

export interface ReviewBase {
  originText: string;
  comment: string;
  range: TextRange;
}

export type ReviewViewStatus =
  | 'PENDING'
  | 'PENDING_CHANGED'
  | 'ACCEPTED'
  | 'OUTDATED'
  | 'REVERT';

export interface Review extends ReviewBase {
  id: number;
  sender?: Sender;
  suggest?: string | null;
  createdAt?: string;
  isApproved?: boolean;
  viewStatus?: ReviewViewStatus;
}
