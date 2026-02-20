export interface QnA {
  qnAId: number;
  question: string;
  answer: string;
  answerSize: number;
  modifiedAt: string;
  isScraped?: boolean; // 스크랩 여부 추가
}

/** CoverLetterEditor와 useReviewState에서 공통으로 사용하는 최소 QnA 인터페이스 */
export type MinimalQnA = Omit<QnA, 'answerSize' | 'modifiedAt'> & {
  modifiedAt?: string;
  version?: number;
};

export interface ShareQnA {
  qnAId: number;
  question: string;
  answer: string;
  version: number;
}

export type ExtraShareQnA = ShareQnA & {
  modifiedAt?: string;
};
