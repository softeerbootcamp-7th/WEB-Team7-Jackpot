import { useQuery } from '@tanstack/react-query';

import type { UserInfoType } from '@/features/auth/types/user';
import { apiClient } from '@/shared/api/apiClient';

export const useGetNickname = (enabled: boolean) => {
  return useQuery<UserInfoType>({
    queryKey: ['userInfo', 'nickname'],
    queryFn: () => apiClient.get<UserInfoType>({ endpoint: '/user/nickname' }),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: enabled,
    retry: (failureCount, error) => {
      // 토큰 만료/권한 없음 에러면 즉시 포기 (로그아웃 처리로 넘김)
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }

      // 최대 2번까지만 재시도
      if (failureCount >= 2) {
        return false;
      }

      // 새로고침 Cancel이나 단순 네트워크 끊김이면 다시 시도!
      return true;
    },

    // 재시도 간격: 바로 시도하지 않고 1초 정도 쉬고 재시도
    retryDelay: 1000,
  });
};
