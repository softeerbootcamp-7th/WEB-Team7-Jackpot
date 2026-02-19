export interface QnA {
  qnAId: number;
  question: string;
  answer: string;
  answerSize: number;
  modifiedAt: string;
  isScraped?: boolean; // 스크랩 여부 추가
}
