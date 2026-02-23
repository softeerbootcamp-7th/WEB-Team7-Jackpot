import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteScrap } from '@/shared/api/scrap';
import { scrapNumKeys } from '@/shared/hooks/queries/scrapQueryKeys';

// 스크랩 삭제 뮤테이션 훅
export const useDeleteScrapMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qnAId: number) => deleteScrap(qnAId),
    onSuccess: (_data, qnAId) => {
      queryClient.invalidateQueries({ queryKey: scrapNumKeys.all });
      queryClient.invalidateQueries({ queryKey: ['qna', qnAId] });
      queryClient.invalidateQueries({ queryKey: ['coverletter', 'scrap'] });
    },
  });
};
