export type ApplyHalf = '상반기' | '하반기';
export type ApiApplyHalf = 'FIRST_HALF' | 'SECOND_HALF';
export type ISODateString = string;
export type Category =
  | '지원동기'
  | '협업경험'
  | '가치관'
  | '직무역량'
  | '성격의 장단점'
  | '입사 후 포부'
  | '문제해결'
  | '커리어 목표'
  | '실패경험'
  | '성장과정'
  | '사회이슈'
  | '기타';

export interface CoverLetterBase {
  coverLetterId: number;
  companyName: string;
  jobPosition: string;
  applyYear: number;
  applyHalf: ApiApplyHalf;
  deadline: ISODateString;
}

export interface CoverLetterQuestion {
  question: string;
  category: Category | '';
}

export interface CoverLetter extends CoverLetterBase {
  questions?: CoverLetterQuestion[];
}

export interface RecentCoverLetter extends CoverLetter {
  questionCount: number;
}

export interface CreateCoverLetterRequest extends Omit<
  CoverLetterBase,
  'coverLetterId'
> {
  questions?: CoverLetterQuestion[];
}

export interface CreateCoverLetterResponse {
  coverLetterId: number;
}

export interface ErrorResponse {
  message: string;
}
