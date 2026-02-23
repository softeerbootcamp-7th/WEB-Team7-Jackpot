import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQueries,
} from '@tanstack/react-query';

import { getQnA, getQnAIdList, updateQnA } from '@/shared/api/qnaApi';
import type { QnA } from '@/shared/types/qna';

// CoverLetterId로 문항 ID 리스트 가져오기
export const useQnAIdListQuery = (coverLetterId: number | null) => {
  return useQuery<number[]>({
    queryKey: ['qnaIdList', coverLetterId],
    queryFn: () => getQnAIdList({ coverLetterId: coverLetterId! }),
    enabled: !!coverLetterId,
  });
};

export const useQnAList = (qnaIds: number[]) => {
  return useSuspenseQueries({
    queries: qnaIds.map((qnaId) => ({
      queryKey: ['qna', { qnaId }],
      queryFn: () => getQnA(qnaId),
    })),
    combine: (results) => {
      if (results.length === 0) {
        return {
          data: [] as QnA[],
          isError: false,
          isLoading: false,
        };
      }

      return {
        data: results.map((r) => r.data) as QnA[],
        isError: results.some((r) => r.isError),
        isLoading: results.some((r) => r.isLoading),
      };
    },
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
