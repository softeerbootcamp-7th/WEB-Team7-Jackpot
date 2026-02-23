import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createScrap } from '@/features/library/api';
import { scrapNumKeys } from '@/shared/hooks/queries/scrapQueryKeys';

// 스크랩 생성 뮤테이션 훅
export const useCreateScrapMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qnAId: number) => createScrap({ qnAId }),
    onSuccess: (_data, qnAId) => {
      queryClient.invalidateQueries({ queryKey: scrapNumKeys.all });
      queryClient.invalidateQueries({ queryKey: ['qna', qnAId] });
      queryClient.invalidateQueries({ queryKey: ['coverletter', 'scrap'] });
    },
  });
};
