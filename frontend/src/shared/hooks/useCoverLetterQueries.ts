import { useCallback, useContext } from 'react';

import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';

import {
  createCoverLetter,
  deleteCoverLetter,
  fetchScraps,
  fetchSharedLink,
  getCoverLetter,
  searchCoverLetters,
  toggleSharedLinkStatus,
} from '@/shared/api/coverLetterApi';
import { getQnAIdList } from '@/shared/api/qnaApi';
import { ToastMessageContext } from '@/shared/context/ToastMessageContext';
import { coverLetterQueryKeys } from '@/shared/hooks/queries/coverLetterKeys';
import { homeKeys } from '@/shared/hooks/queries/homeKeys';
import { libraryKeys } from '@/shared/hooks/queries/libraryKeys';
import { scrapNumKeys } from '@/shared/hooks/queries/scrapKeys';
import type {
  CreateCoverLetterRequest,
  CreateCoverLetterResponse,
} from '@/shared/types/coverLetter';

// 1. 통합된 단건 조회 훅 (Safe Version)
// - ID가 없거나 유효하지 않으면 요청을 보내지 않음
export const useCoverLetter = (coverLetterId: number) => {
  const isValidId =
    !!coverLetterId && !Number.isNaN(coverLetterId) && coverLetterId > 0;

  return useQuery({
    queryKey: coverLetterQueryKeys.detail(coverLetterId),
    queryFn: () => getCoverLetter(coverLetterId),
    enabled: isValidId, // 유효성 검사 통과 시에만 실행
    staleTime: 5 * 60 * 1000,
  });
};

// 2. 단건 조회 훅 (Suspense Version)
export const useSuspenseCoverLetter = (coverLetterId: number) => {
  return useSuspenseQuery({
    queryKey: coverLetterQueryKeys.detail(coverLetterId),
    queryFn: () => getCoverLetter(coverLetterId),
    staleTime: 5 * 60 * 1000,
  });
};

// 3. 자소서 + 문항 ID 목록 동시 조회 (Suspense)
export const useCoverLetterWithQnAIds = (coverLetterId: number) => {
  const results = useSuspenseQueries({
    queries: [
      {
        queryKey: coverLetterQueryKeys.detail(coverLetterId),
        queryFn: () => getCoverLetter(coverLetterId),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: coverLetterQueryKeys.qnaIdList(coverLetterId),
        queryFn: () => getQnAIdList({ coverLetterId }),
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  return {
    coverLetter: results[0].data,
    qnaIds: results[1].data,
  };
};

// 공통으로 사용할 성공 핸들러
// 생성/수정/삭제 후에는 무조건 목록과 상세 데이터를 모두 갱신합니다.
export const useInvalidateCoverLetters = () => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: coverLetterQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: ['coverletter'] });
    queryClient.invalidateQueries({ queryKey: homeKeys.all });
    queryClient.invalidateQueries({ queryKey: libraryKeys.all });
  }, [queryClient]);
};

const useInvalidateDeleteCoverLetter = () => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: coverLetterQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: ['coverletter'] });
    queryClient.invalidateQueries({ queryKey: homeKeys.all });
    queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    // scrapNum 데이터를 즉시 refetch하도록 설정
    queryClient.invalidateQueries({
      queryKey: scrapNumKeys.all,
      exact: true,
    });
  }, [queryClient]);
};

// 공고(자기소개서) 등록 훅
export const useCreateCoverLetter = () => {
  // 위에서 만든 무효화 로직을 가져옵니다.
  const invalidateAllRelatedQueries = useInvalidateCoverLetters();

  return useMutation<
    CreateCoverLetterResponse,
    Error,
    CreateCoverLetterRequest
  >({
    mutationFn: createCoverLetter,
    onSuccess: () => {
      invalidateAllRelatedQueries();
    },
  });
};

// 자기소개서(공고) 삭제
export const useDeleteCoverLetter = () => {
  const invalidate = useInvalidateDeleteCoverLetter();

  return useMutation<void, Error, { coverLetterId: number }>({
    mutationFn: (variables) => deleteCoverLetter(variables.coverLetterId),
    onSuccess: () => invalidate(),
  });
};

// 기업명 직무명 기반 검색
export const useCoverLetterSearch = (searchWord = '', size = 9, page = 1) => {
  return useSuspenseQuery({
    queryKey: ['coverletter', 'search', { searchWord, size, page }],
    queryFn: () => searchCoverLetters({ searchWord, size, page }),
    staleTime: 5 * 60 * 1000,
  });
};

// 스크랩한 자기소개서 내에서 검색 (무한 스크롤)
export const useScrapCoverLetters = (searchWord = '', size = 9) => {
  return useSuspenseInfiniteQuery({
    queryKey: ['coverletter', 'scrap', { searchWord, size }],
    queryFn: ({ pageParam }) =>
      fetchScraps({ searchWord, size, lastQnaId: pageParam }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      const lastScrap = lastPage.scraps.at(-1);
      if (!lastPage.hasNext || !lastScrap) return undefined;
      return lastScrap.id;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// 첨삭 링크 조회
export const useSharedLink = (
  coverLetterId: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['coverletter', 'sharedLink', { coverLetterId }],
    queryFn: () => fetchSharedLink({ coverLetterId }),
    enabled,
  });
};

// 첨삭 링크 활성화/비활성화
export const useSharedLinkToggle = () => {
  const queryClient = useQueryClient();
  const toast = useContext(ToastMessageContext);

  return useMutation({
    mutationFn: ({
      coverLetterId,
      active,
    }: {
      coverLetterId: number;
      active: boolean;
    }) => toggleSharedLinkStatus({ coverLetterId, active }),
    onSuccess: (_, { coverLetterId, active }) => {
      queryClient.invalidateQueries({
        queryKey: ['coverletter', 'sharedLink', { coverLetterId }],
      });

      if (active) {
        queryClient.invalidateQueries({
          queryKey: ['reviews', { coverLetterId }],
        });
      } else {
        queryClient.removeQueries({
          queryKey: ['reviews', { coverLetterId }],
        });
      }

      const qnaIdList = queryClient.getQueryData<number[]>([
        'qnaIdList',
        coverLetterId,
      ]);

      if (qnaIdList) {
        queryClient.invalidateQueries({
          queryKey: ['qnaIdList', coverLetterId],
        });
      }

      queryClient.invalidateQueries({ queryKey: ['qna'] });

      toast?.showToast('첨삭 링크 상태가 변경되었습니다.', true);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : '첨삭 링크 상태 변경에 실패했습니다.';

      toast?.showToast(message, false);
    },
  });
};
