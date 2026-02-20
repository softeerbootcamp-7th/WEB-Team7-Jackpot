import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createCoverLetter,
  deleteCoverLetter,
  updateCoverLetter,
} from '@/shared/api/coverLetterApi';
import { coverLetterQueryKeys } from '@/shared/hooks/queries/coverLetterQueryKeys';
import type {
  CreateCoverLetterRequest,
  CreateCoverLetterResponse,
  UpdateCoverLetter,
} from '@/shared/types/coverLetter';

// [박소민] 공통으로 사용할 성공 핸들러
// 생성/수정/삭제 후에는 무조건 목록과 상세 데이터를 모두 갱신합니다.
const useInvalidateCoverLetters = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: coverLetterQueryKeys.all });
};

// 3. 새 공고 등록
export const useCreateCoverLetter = () => {
  const invalidate = useInvalidateCoverLetters();

  return useMutation<
    CreateCoverLetterResponse,
    Error,
    CreateCoverLetterRequest
  >({
    mutationFn: createCoverLetter,
    onSuccess: () => invalidate(), // ['coverLetters'] 전체 무효화
    onError: (error) => console.error('생성 실패:', error.message),
  });
};

// 4. 공고 수정
export const useUpdateCoverLetter = () => {
  const invalidate = useInvalidateCoverLetters();

  return useMutation<void, Error, UpdateCoverLetter>({
    mutationFn: updateCoverLetter,
    onSuccess: () => invalidate(), // ['coverLetters'] 전체 무효화
    onError: (error) => console.error('수정 실패:', error.message),
  });
};

// 5. 공고 삭제
export const useDeleteCoverLetter = () => {
  const invalidate = useInvalidateCoverLetters();

  return useMutation<void, Error, { coverLetterId: number }>({
    mutationFn: (variables) => deleteCoverLetter(variables.coverLetterId),
    onSuccess: () => invalidate(), // ['coverLetters'] 전체 무효화
    onError: (error) => console.error('삭제 실패:', error.message),
  });
};
