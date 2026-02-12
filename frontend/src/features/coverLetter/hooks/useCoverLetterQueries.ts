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
      if (!lastPage.hasNext || lastPage.scraps.length === 0) return undefined;
      return lastPage.scraps[lastPage.scraps.length - 1].questionId;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// 첨삭 링크 조회
export const useSharedLink = (coverLetterId: number) => {
  return useQuery({
    queryKey: ['sharedLink', coverLetterId],
    queryFn: () => fetchSharedLink({ coverLetterId }),
    staleTime: 0,
  });
};

// 첨삭 링크 활성화/비활성화
export const useSharedLinkToggle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      coverLetterId,
      active,
    }: {
      coverLetterId: number;
      active: boolean;
    }) => toggleSharedLinkStatus({ coverLetterId, active }),
    onSuccess: (_, { coverLetterId }) => {
      queryClient.invalidateQueries({
        queryKey: ['sharedLink', coverLetterId],
      });
    },
  });
};
