import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateCoverLetter } from '@/shared/api/coverLetterApi';
import { useInvalidateCoverLetters } from '@/shared/hooks/useCoverLetterQueries';
import type { UpdateCoverLetter } from '@/shared/types/coverLetter';

// 4. 공고 수정
export const useUpdateCoverLetter = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateCoverLetters();

  return useMutation<void, Error, UpdateCoverLetter>({
    mutationFn: updateCoverLetter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search'] }); // ['search'] 전체 무효화
      queryClient.invalidateQueries({ queryKey: ['coverletter', 'scrap'] }); // ['scrap'] 전체 무효화
      invalidate();
    }, // ['coverLetters'] 전체 무효화
  });
};
