import type { Category, CoverLetterBase } from '@/shared/types/coverLetter';

export interface CalendarCoverLetterItem extends CoverLetterBase {
  questionCount: number;
}

export interface CalendarResponse {
  totalCount: number;
  coverLetters: CalendarCoverLetterItem[];
  hasNext: boolean;
}

export interface CalendarRequest {
  startDate: string;
  endDate: string;
  size?: number;
  isShared?: boolean;
}

export interface QnAListResponse {
  qnAs: {
    qnAId: number;
    question: string;
    category: Category;
  }[];
}
