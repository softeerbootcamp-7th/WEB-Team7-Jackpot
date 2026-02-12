import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';

import { getQnA, getQnAIdList } from '@/shared/api/qnaApi';
import { updateQnA } from '@/shared/api/qnaApi';
import type { QnA } from '@/shared/types/qna';

export const useQnAIdList = (coverLetterId: number) => {
  return useSuspenseQuery({
    queryKey: ['qna', 'idList', { coverLetterId }],
    queryFn: () => getQnAIdList({ coverLetterId }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useQnAList = (qnaIds: number[]) => {
  return useSuspenseQueries({
    queries: qnaIds.map((qnaId) => ({
      queryKey: ['qna', { qnaId }],
      queryFn: () => getQnA(qnaId),
      staleTime: 5 * 60 * 1000,
    })),
    combine: (results) => ({
      data: results.map((r) => r.data) as QnA[],
      isError: results.some((r) => r.isError),
    }),
  });
};

export const useUpdateQnA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQnA,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['qna', { qnaId: data.qnAId }],
      });
    },
  });
};
