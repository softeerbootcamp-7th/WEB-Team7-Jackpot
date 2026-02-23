import { useContext } from 'react';

import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';

import {
  fetchScraps,
  fetchSharedLink,
  toggleSharedLinkStatus,
} from '@/features/coverLetter/api/coverLetterApi';
import { searchCoverLetters } from '@/shared/api/coverLetterApi';
import { ToastMessageContext } from '@/shared/context/ToastMessageContext';

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
    // staleTime: 0  // 기본값 그대로, 항상 새로 조회
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

      toast?.showToast('첨삭 링크 상태가 변경되었습니다.', true);
    },
    onError: (error: unknown) => {
      console.error('첨삭 링크 토글 실패', error);

      const message =
        error instanceof Error
          ? error.message
          : '첨삭 링크 상태 변경에 실패했습니다.';

      toast?.showToast(message, false);
    },
  });
};
