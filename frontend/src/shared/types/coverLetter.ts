export type ApplyHalf = '상반기' | '하반기';

export type ApiApplyHalf = 'FIRST_HALF' | 'SECOND_HALF';

export type ISODateString = string;

// 질문 아이템 타입
export interface CoverLetterQuestion {
  question: string;
  category: string;
}

export interface CoverLetter {
  coverLetterId: number;
  companyName: string;
  jobPosition: string;
  applyYear: number;
  applyHalf: ApiApplyHalf;
  deadline: ISODateString;
  questions?: CoverLetterQuestion[];
}

export interface RecentCoverLetter extends CoverLetter {
  questionCount: number;
}

// 질문 아이템 타입
export interface CoverLetterQuestion {
  question: string;
  category: string;
}
