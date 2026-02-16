import type { ApiApplyHalf } from '@/shared/types/coverLetter';

export interface CoverLetterItem {
  coverLetterId: number;
  companyName: string;
  jobPosition: string;
  applyYear: number;
  applyHalf: ApiApplyHalf;
  deadline: string;
  questionCount: number;
}

export interface CalendarResponse {
  totalCount: number;
  coverLetters: CoverLetterItem[];
  hasNext: boolean;
}

export interface CalendarRequest {
  startDate: string;
  endDate: string;
  size?: number;
  isShared?: boolean;
}

export interface CoverLetterInfo {
  coverLetterId: number;
  companyName: string;
  applyYear: number;
  applyHalf: ApiApplyHalf;
  jobPosition: string;
  deadline: string;
}

export interface ErrorResponse {
  message: string;
}
