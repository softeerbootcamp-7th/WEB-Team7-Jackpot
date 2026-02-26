import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { fetchFilterCoverLetter } from '@/shared/api/coverLetterApi';
import type { FilterRequest } from '@/shared/types/coverLetter';

export const useInfiniteCoverLetterFilter = (params: FilterRequest) => {
  return useSuspenseInfiniteQuery({
    queryKey: ['coverletter', 'filter', 'infinite', params],
    queryFn: ({ pageParam }) =>
      fetchFilterCoverLetter(params, pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      const lastItem = lastPage.coverLetters?.at(-1);
      // 데이터가 없거나, 받아온 데이터 수가 요청한 size보다 작으면 마지막 페이지
      if (!lastItem || !lastPage.hasNext) return undefined;
      return lastItem.coverLetterId;
    },
    staleTime: 0,
  });
};
