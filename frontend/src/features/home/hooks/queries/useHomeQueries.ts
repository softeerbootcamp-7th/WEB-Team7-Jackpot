import { useSuspenseQuery } from '@tanstack/react-query';

import {
  fetchCalendarDates,
  fetchHomeCount,
  fetchUpcomingDeadlines,
} from '@/features/home/api/homeApi';
import {
  MAX_COVER_LETTER_SIZE_PER_DEADLINE,
  MAX_DEADLINE_SIZE,
} from '@/features/home/constants';
import { homeKeys } from '@/features/home/hooks/queries/keys';
import type { CalendarDatesResponse } from '@/features/home/types/home';
import { searchCoverLetters } from '@/shared/api/coverLetterApi';
import { getTodayISODate } from '@/shared/utils/dates';

// 홈 화면 통계 데이터
export const useHomeCount = (date?: string) => {
  const targetDate = date || getTodayISODate();

  return useSuspenseQuery({
    queryKey: homeKeys.count(targetDate),
    queryFn: () => fetchHomeCount(targetDate),
    staleTime: 5 * 60 * 1000,
  });
};

// 캘린더 날짜 조회
export const useCalendarDates = (
  startDate: string,
  endDate: string,
): CalendarDatesResponse => {
  const { data } = useSuspenseQuery({
    queryKey: homeKeys.calendar(startDate, endDate),
    queryFn: () => fetchCalendarDates({ startDate, endDate }),
    staleTime: 5 * 60 * 1000,
  });

  return data as CalendarDatesResponse;
};

// 다가오는 일정
export const useUpcomingDeadlines = (
  maxDeadLineSize = MAX_DEADLINE_SIZE,
  maxCoverLetterSizePerDeadLine = MAX_COVER_LETTER_SIZE_PER_DEADLINE,
  date?: string,
) => {
  const targetDate = date || getTodayISODate();

  return useSuspenseQuery({
    queryKey: homeKeys.upcomingDeadlines(
      targetDate,
      maxDeadLineSize,
      maxCoverLetterSizePerDeadLine,
    ),
    queryFn: () =>
      fetchUpcomingDeadlines({
        date: targetDate,
        maxDeadLineSize,
        maxCoverLetterSizePerDeadLine,
      }),
    staleTime: 5 * 60 * 1000,
  });
};

// 작성중인 자기소개서
export const useRecentCoverLetters = (size = 6) => {
  return useSuspenseQuery({
    queryKey: ['coverletter', 'recent', { size }],
    queryFn: () => searchCoverLetters({ size, page: 1 }),
    staleTime: 60 * 1000,
  });
};
