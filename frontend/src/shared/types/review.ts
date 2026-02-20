export interface TextRange {
  start: number;
  end: number;
}

export interface Sender {
  id: string;
  nickname: string;
}

export interface ReviewBase {
  selectedText: string;
  revision: string;
  comment: string;
  range: TextRange;
}

export type ReviewViewStatus =
  | 'PENDING'
  | 'PENDING_CHANGED'
  | 'ACCEPTED'
  | 'OUTDATED';

export interface Review extends ReviewBase {
  id: number;
  sender?: Sender;
  originText?: string;
  suggest?: string | null;
  createdAt?: string;
  isValid?: boolean;
  isApproved?: boolean;
  viewStatus?: ReviewViewStatus;
}
