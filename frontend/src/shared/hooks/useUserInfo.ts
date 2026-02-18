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
    retry: false,
  });
};
