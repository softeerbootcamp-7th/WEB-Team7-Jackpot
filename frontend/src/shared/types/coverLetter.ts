import type { CATEGORY_VALUES } from '@/shared/constants/createCoverLetter';

export type ApplyHalf = '상반기' | '하반기';
export type ApiApplyHalf = 'FIRST_HALF' | 'SECOND_HALF';
export type ISODateString = string;
export type Category = (typeof CATEGORY_VALUES)[number];

export interface CoverLetterBase {
  coverLetterId: number;
  companyName: string;
  jobPosition: string;
  applyYear?: number; // 방어 로직 추가로 인해 optional 처리
  applyHalf?: ApiApplyHalf;
  deadline?: ISODateString; // 마감일 달라고 하기 (라이브러리) (API에서 아직 안 줌) - ISODateString 형식으로 가정
}

export interface CoverLetterQuestion {
  qnAId?: number | null; // 신규 추가 시 null 전송, 기존 질문 수정 시 number, 미설정은 undefined
  question: string;
  category: Category | ''; // 초기값은 빈 문자열로 설정 (카테고리 선택 안 했을 때)
}

export interface CoverLetterType extends CoverLetterBase {
  questions?: CoverLetterQuestion[];
}

export interface RecentCoverLetterType extends CoverLetterType {
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

export interface UpdateCoverLetter {
  coverLetter: Omit<CoverLetterType, 'questions'>;
  questions: CoverLetterQuestion[];
}

export interface ErrorResponse {
  message: string;
}

export interface CalendarCoverLetterItem extends CoverLetterBase {
  questionCount: number;
}

export interface FilterResponse {
  totalCount: number;
  coverLetters: CalendarCoverLetterItem[];
  hasNext: boolean;
}

export interface FilterRequest {
  startDate: string;
  endDate: string;
  size?: number;
  isShared?: boolean;
}

export interface ScrapItem {
  id: number;
  companyName: string;
  jobPosition: string;
  applySeason: string; // "2025년 하반기"
  question: string;
  answer: string;
  coverLetterId: number;
}

export interface GetScrapsResponse {
  scraps: ScrapItem[];
  hasNext: boolean;
}

export interface TextChangeResult {
  changeStart: number;
  oldLength: number;
  newLength: number;
}
