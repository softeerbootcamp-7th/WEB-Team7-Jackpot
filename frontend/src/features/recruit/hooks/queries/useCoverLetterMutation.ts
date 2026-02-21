import { useMutation } from '@tanstack/react-query';

import {
  deleteCoverLetter,
  updateCoverLetter,
} from '@/shared/api/coverLetterApi';
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

// 5. 공고 삭제
export const useDeleteCoverLetter = () => {
  const invalidate = useInvalidateCoverLetters();

  return useMutation<void, Error, { coverLetterId: number }>({
    mutationFn: (variables) => deleteCoverLetter(variables.coverLetterId),
    onSuccess: () => invalidate(), // ['coverLetters'] 전체 무효화
  });
};
