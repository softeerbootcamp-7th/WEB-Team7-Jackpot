import { useQuery } from '@tanstack/react-query';

import { getReviewsByQnaId } from '@/shared/api/reviewApi';

export const useReviewsByQnaId = (qnaId: number | undefined) => {
  return useQuery({
    queryKey: ['reviews', { qnaId }],
    queryFn: () => getReviewsByQnaId(qnaId!),
    enabled: qnaId != null,
    staleTime: 5 * 60 * 1000,
  });
};
