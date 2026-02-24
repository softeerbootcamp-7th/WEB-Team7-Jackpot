import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQueries,
} from '@tanstack/react-query';

import { searchCoverLetters } from '@/shared/api/coverLetterApi';
import { getQnA, getQnAIdList, updateQnA } from '@/shared/api/qnaApi';
import { libraryKeys } from '@/shared/hooks/queries/libraryKeys';
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
      // 라이브러리 상세 페이지 (폴더 내 문항 목록) 갱신
      queryClient.invalidateQueries({
        queryKey: libraryKeys.detail(data.qnAId),
      });
      // 라이브러리 리스트 페이지 갱신 원래는 folderId로 갱신해야 하지만, 폴더 ID를 모르는 경우도 있어서 전체 리스트를 갱신하도록 함
      queryClient.invalidateQueries({
        queryKey: libraryKeys.lists('QUESTION'),
      });
    },
  });
};

// 라이브러리 전체 검색 (무한 스크롤 버전)
export const useInfiniteCoverLetterSearch = (searchWord = '', size = 9) => {
  return useSuspenseInfiniteQuery({
    queryKey: ['coverletter', 'search', 'infinite', { searchWord, size }],
    queryFn: ({ pageParam }) =>
      searchCoverLetters({ searchWord, size, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { number, totalPage } = lastPage.page;
      return number < totalPage ? number + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};
