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
  applyYear?: number; // [박소민] 방어 로직 추가로 인해 optional 처리
  applyHalf?: ApiApplyHalf;
  deadline?: ISODateString; // [박소민] 마감일 달라고 하기 (라이브러리) (API에서 아직 안 줌) - ISODateString 형식으로 가정
}

export interface CoverLetterQuestion {
  qnAId?: number | null; // 신규 추가 시 null 전송, 기존 질문 수정 시 number, 미설정은 undefined
  question: string;
  category: Category | ''; // 초기값은 빈 문자열로 설정 (카테고리 선택 안 했을 때)
}

export interface CoverLetterType extends CoverLetterBase {
  questions?: CoverLetterQuestion[];
}

export interface RecentCoverLetter extends CoverLetterType {
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
