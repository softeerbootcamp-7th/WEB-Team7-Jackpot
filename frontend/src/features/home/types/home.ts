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

export type CalendarDatesResponse = ISODateString[]; // 'YYYY-MM-DD' 형식의 날짜 문자열 배열

export interface MyApplicationCalendarDayInfo {
  dateString: ISODateString; // 'YYYY-MM-DD' 형식의 날짜 문자열
  day: number;
  dayOfWeek: number;
  isToday: boolean;
  isPast: boolean;
  hasSchedule: boolean;
}

export type MyApplicationCalendarWeek = MyApplicationCalendarDayInfo[];

export type MyApplicationCalendarData = MyApplicationCalendarWeek[];
