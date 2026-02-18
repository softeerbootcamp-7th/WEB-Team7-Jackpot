export interface QnA {
  qnAId: number;
  question: string;
  answer: string;
  answerSize: number;
  modifiedAt: string;
}

/** CoverLetterEditor와 useReviewState에서 공통으로 사용하는 최소 QnA 인터페이스 */
export type MinimalQnA = Omit<QnA, 'answerSize' | 'modifiedAt'> & {
  modifiedAt?: string;
};
