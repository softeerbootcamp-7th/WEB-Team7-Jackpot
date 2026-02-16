import type {
  CalendarRequest,
  CalendarResponse,
  CoverLetterItem,
} from '@/features/recruit/types';

export const MOCK_CALENDAR_COVER_LETTERS: CoverLetterItem[] = [
  {
    coverLetterId: 1001,
    companyName: '현대자동차',
    jobPosition: '인포테인먼트 기획',
    applyYear: 2026,
    applyHalf: 'FIRST_HALF',
    deadline: '2026-02-10',
    questionCount: 3,
  },
  {
    coverLetterId: 1002,
    companyName: '기아',
    jobPosition: 'PBV 비즈니스 기획',
    applyYear: 2026,
    applyHalf: 'FIRST_HALF',
    deadline: '2026-02-15',
    questionCount: 4,
  },
  {
    coverLetterId: 1003,
    companyName: '현대건설',
    jobPosition: '건축시공',
    applyYear: 2026,
    applyHalf: 'FIRST_HALF',
    deadline: '2026-02-18',
    questionCount: 2,
  },
  {
    coverLetterId: 1004,
    companyName: 'LG전자',
    jobPosition: '제품기획',
    applyYear: 2026,
    applyHalf: 'FIRST_HALF',
    deadline: '2026-03-03',
    questionCount: 3,
  },
  {
    coverLetterId: 1005,
    companyName: '네이버',
    jobPosition: '서비스 기획',
    applyYear: 2026,
    applyHalf: 'FIRST_HALF',
    deadline: '2026-03-12',
    questionCount: 5,
  },
  {
    coverLetterId: 1006,
    companyName: '카카오',
    jobPosition: '프로덕트 매니저',
    applyYear: 2026,
    applyHalf: 'FIRST_HALF',
    deadline: '2026-03-20',
    questionCount: 2,
  },
];

const isWithinRange = (date: string, startDate: string, endDate: string) => {
  return date >= startDate && date <= endDate;
};

export const getMockCalendarResponse = (
  params: CalendarRequest,
  lastIdParam?: number,
): CalendarResponse => {
  const size = params.size ?? 7;

  const filtered = MOCK_CALENDAR_COVER_LETTERS.filter((item) =>
    isWithinRange(item.deadline, params.startDate, params.endDate),
  ).sort((a, b) => a.deadline.localeCompare(b.deadline));

  const startIndex = lastIdParam
    ? Math.max(
        filtered.findIndex((item) => item.coverLetterId === lastIdParam) + 1,
        0,
      )
    : 0;

  const paged = filtered.slice(startIndex, startIndex + size);
  const hasNext = startIndex + size < filtered.length;

  return {
    totalCount: filtered.length,
    coverLetters: paged,
    hasNext,
  };
};

export const fetchCalendarDatesMock = (
  params: CalendarRequest,
  lastIdParam?: number,
) => {
  return Promise.resolve(getMockCalendarResponse(params, lastIdParam));
};
