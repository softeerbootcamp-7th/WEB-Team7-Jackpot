import type { CoverLetterBase } from '@/shared/types/coverLetter';

export interface CoverLetterItem extends CoverLetterBase {
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

export type CoverLetterInfo = Omit<CoverLetterItem, 'questionCount'>;
