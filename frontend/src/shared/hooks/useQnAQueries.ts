import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQueries,
} from '@tanstack/react-query';

import {
  getQnA,
  getQnAIdList,
  searchLibrary,
  updateQnA,
} from '@/shared/api/qnaApi';
import { libraryKeys } from '@/shared/hooks/queries/libraryKeys';
import type { QnA } from '@/shared/types/qna';
import { flattenInfiniteQnAData } from '@/shared/utils/coverLetter';

// CoverLetterId로 문항 ID 리스트 가져오기
export const useQnAIdListQuery = (coverLetterId: number | null) => {
  return useQuery<number[]>({
    queryKey: ['qnaIdList', coverLetterId],
    queryFn: () => getQnAIdList({ coverLetterId: coverLetterId! }),
    enabled: !!coverLetterId,
  });
};

// 문항 상세 정보 가져오기 (여러 개)
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

// 자기소개서 answer 수정
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
      queryClient.invalidateQueries({ queryKey: ['search'] }); // ['search'] 전체 무효화
      queryClient.invalidateQueries({ queryKey: ['coverletter', 'scrap'] }); // ['scrap'] 전체 무효화
      queryClient.invalidateQueries({
        queryKey: ['qna', { qnaId: data.qnAId }],
      });
    },
  });
};

// (문항) 라이브러리 검색 (무한 스크롤)
export const useInfiniteQnASearch = (searchWord = '', size = 10) => {
  return useSuspenseInfiniteQuery({
    queryKey: ['search', 'qna', { searchWord, size }],
    queryFn: ({ pageParam }) =>
      searchLibrary(searchWord, pageParam as number | undefined, size),

    initialPageParam: undefined as number | undefined,

    getNextPageParam: (lastPage) => {
      const lastItem = lastPage.qnAs?.at(-1);
      if (!lastPage.hasNext || !lastItem) return undefined;
      return lastItem.qnAId;
    },
    staleTime: 5 * 60 * 1000,

    // 데이터를 컴포넌트로 전달하기 전에 평탄화
    select: (data) => flattenInfiniteQnAData(data),
  });
};
