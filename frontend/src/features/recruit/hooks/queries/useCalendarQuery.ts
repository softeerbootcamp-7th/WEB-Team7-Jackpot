import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import { fetchCalendarDates } from '@/features/recruit/api';
import { coverLetterKeys } from '@/features/recruit/hooks/queries/keys';
import type { CalendarParams } from '@/features/recruit/types';
import { getCoverLetter } from '@/shared/api/coverLetterApi';

// 1. 달력 조회
export const useInfiniteCalendarDates = (params: CalendarParams) => {
  return useInfiniteQuery({
    queryKey: coverLetterKeys.calendar(params),

    // 초기 커서 값 (첫 요청은 id이 없어 undefined)
    initialPageParam: undefined as number | undefined,

    // (lastIdParam=pageParam)
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

// 2. 자기소개서 단건 조회
export const useCoverLetterDetail = (coverLetterId: number) => {
  return useQuery({
    queryKey: coverLetterKeys.detail(coverLetterId),
    queryFn: () => getCoverLetter(coverLetterId),
    enabled:
      !!coverLetterId && !Number.isNaN(coverLetterId) && coverLetterId > 0,
  });
};
