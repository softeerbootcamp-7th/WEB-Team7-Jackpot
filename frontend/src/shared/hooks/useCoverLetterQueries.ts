import { useCallback } from 'react';

import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';

import {
  createCoverLetter,
  deleteCoverLetter,
  getCoverLetter,
} from '@/shared/api/coverLetterApi';
import { getQnAIdList } from '@/shared/api/qnaApi';
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
