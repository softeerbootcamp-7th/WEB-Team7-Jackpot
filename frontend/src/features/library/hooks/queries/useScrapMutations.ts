import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createScrap, deleteScrap } from '@/features/library/api';
import { scrapNumKeys } from '@/features/library/hooks/queries/keys';

export const useCreateScrapMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScrap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapNumKeys.all });
    },
    onError: (error) => {
      console.error('스크랩 생성 실패:', error);
      // [박소민] TODO: 토스트(Toast) 알림을 띄우는 로직을 추가
    },
  });
};

export const useDeleteScrapMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qnAId: number) => deleteScrap(qnAId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapNumKeys.all });
    },
    onError: (error) => {
      console.error('스크랩 삭제 실패:', error);
    },
  });
};
