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

// 활성 리뷰: 화면에 표시되고 새 리뷰 작성을 차단하는 상태
export const ACTIVE_REVIEW_STATUSES: readonly ReviewViewStatus[] = [
  'PENDING',
  'ACCEPTED',
];

export const isActiveViewStatus = (
  status: ReviewViewStatus | undefined,
): boolean => status !== undefined && ACTIVE_REVIEW_STATUSES.includes(status);

export interface Review extends ReviewBase {
  id: number;
  sender?: Sender;
  suggest?: string | null;
  createdAt?: string;
  isApproved?: boolean;
  viewStatus?: ReviewViewStatus;
}
