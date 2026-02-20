export type ApplyHalf = '상반기' | '하반기';
export type ApiApplyHalf = 'FIRST_HALF' | 'SECOND_HALF';
export type ISODateString = string;

export interface CoverLetterQuestion {
  question: string;
  category: string;
}

export interface CoverLetterType {
  coverLetterId: number;
  companyName: string;
  jobPosition: string;
  applyYear: number;
  applyHalf: ApiApplyHalf;
  deadline: ISODateString;
  questions?: CoverLetterQuestion[];
}

export interface RecentCoverLetterType extends CoverLetterType {
  questionCount: number;
}

// --- Added Types (Moved from features) ---

export interface CreateCoverLetterRequest {
  companyName: string;
  applyYear: number;
  applyHalf: ApiApplyHalf;
  jobPosition: string;
  deadline: string;
  questions?: CoverLetterQuestion[];
}

export interface CreateCoverLetterResponse {
  coverLetterId: number;
}
