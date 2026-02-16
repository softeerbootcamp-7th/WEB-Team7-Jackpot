import {
  useQuery,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';

import { getCoverLetter } from '@/shared/api/coverLetterApi';
import { getQnAIdList } from '@/shared/api/qnaApi';
import { coverLetterQueryKeys } from '@/shared/hooks/queries/coverLetterQueryKeys';

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
