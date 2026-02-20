import type { ISODateString } from '@/shared/types/coverLetter';

export interface HomeCountResponse {
  coverLetterCount: number;
  qnaCount: number;
  seasonCoverLetterCount: number;
}

export interface UpcomingDeadline {
  deadline: ISODateString;
  coverLetters: {
    coverLetterId: number;
    companyName: string;
    jobPosition: string;
  }[];
}

export type UpcomingDeadlinesResponse = UpcomingDeadline[];

export interface CalendarDatesResponse {
  coverLetterDates: string[];
}
