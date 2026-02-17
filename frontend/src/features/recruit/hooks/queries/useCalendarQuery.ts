import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { fetchCalendarDates } from '@/features/recruit/api';
import type { CalendarRequest } from '@/features/recruit/types';
import { coverLetterQueryKeys } from '@/shared/hooks/queries/coverLetterQueryKeys';

// 1. 달력 조회
export const useInfiniteCalendarDates = (params: CalendarRequest) => {
  return useInfiniteQuery({
    queryKey: coverLetterQueryKeys.calendar(params),

    // 초기 커서 값
    initialPageParam: undefined as number | undefined,

    queryFn: ({ pageParam }) => fetchCalendarDates(params, pageParam),

    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) {
        return undefined;
      }
      const lastItem = lastPage.coverLetters.at(-1);
      return lastItem ? lastItem.coverLetterId : undefined;
    },

    placeholderData: keepPreviousData,
    enabled: !!params.startDate && !!params.endDate,
  });
};

// 2. 자기소개서 단건 조회 삭제
