import { useSuspenseQuery } from '@tanstack/react-query';

import { getCoverLetter } from '@/shared/api/coverLetterApi';

export const useCoverLetter = (coverLetterId: number) => {
  return useSuspenseQuery({
    queryKey: ['coverletter', { coverLetterId }],
    queryFn: () => getCoverLetter(coverLetterId),
    staleTime: 5 * 60 * 1000,
  });
};
