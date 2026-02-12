import { useMutation, useQueryClient } from '@tanstack/react-query';

// 앞서 만든 api 함수들을 import (경로는 실제에 맞게 수정)
import { createScrap, deleteScrap } from '@/features/library/api';
import { scrapNumKeys } from '@/features/library/hooks/queries/keys';

// 1. 스크랩 생성 (POST) 커스텀 훅
export const useCreateScrapMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScrap, // 인자로 들어온 payload를 createScrap에 전달
    onSuccess: () => {
      // ✅ 핵심: 스크랩이 추가되었으니, 기존의 '스크랩 개수' 데이터를 만료시키고 새로고침
      queryClient.invalidateQueries({ queryKey: scrapNumKeys.all });

      // 만약 '스크랩 리스트'를 불러오는 queryKey가 따로 있다면 여기서 같이 무효화해주면 돼.
      // queryClient.invalidateQueries({ queryKey: scrapListKeys.all });
    },
    onError: (error) => {
      console.error('스크랩 생성 실패:', error);
      // 필요하다면 여기서 토스트(Toast) 알림을 띄우는 로직을 추가할 수 있어.
    },
  });
};

// 2. 스크랩 삭제 (DELETE) 커스텀 훅
export const useDeleteScrapMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qnAId: number) => deleteScrap(qnAId),
    onSuccess: () => {
      // ✅ 핵심: 스크랩이 삭제되었으니, 역시 '스크랩 개수' 데이터를 갱신
      queryClient.invalidateQueries({ queryKey: scrapNumKeys.all });
    },
    onError: (error) => {
      console.error('스크랩 삭제 실패:', error);
    },
  });
};
