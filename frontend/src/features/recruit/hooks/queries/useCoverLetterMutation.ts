import { useMutation } from '@tanstack/react-query';

import { updateCoverLetter } from '@/shared/api/coverLetterApi';
import { useInvalidateCoverLetters } from '@/shared/hooks/useCoverLetterQueries';
import type { UpdateCoverLetter } from '@/shared/types/coverLetter';

// 4. 공고 수정
export const useUpdateCoverLetter = () => {
  const invalidate = useInvalidateCoverLetters();

  return useMutation<void, Error, UpdateCoverLetter>({
    mutationFn: updateCoverLetter,
    onSuccess: () => invalidate(), // ['coverLetters'] 전체 무효화
  });
};
