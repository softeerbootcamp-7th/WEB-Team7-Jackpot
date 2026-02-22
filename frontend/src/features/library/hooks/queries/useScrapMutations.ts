import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createScrap, deleteScrap } from '@/features/library/api';
import { scrapNumKeys } from '@/features/library/hooks/queries/keys';

// 스크랩 생성 뮤테이션 훅
export const useCreateScrapMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qnAId: number) => createScrap({ qnAId }),
    onSuccess: (_data, qnAId) => {
      queryClient.invalidateQueries({ queryKey: scrapNumKeys.all });
      queryClient.invalidateQueries({ queryKey: ['qna', qnAId] });
    },
  });
};

// 스크랩 삭제 뮤테이션 훅
export const useDeleteScrapMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qnAId: number) => deleteScrap(qnAId),
    onSuccess: (_data, qnAId) => {
      queryClient.invalidateQueries({ queryKey: scrapNumKeys.all });
      queryClient.invalidateQueries({ queryKey: ['qna', qnAId] });
    },
  });
};
