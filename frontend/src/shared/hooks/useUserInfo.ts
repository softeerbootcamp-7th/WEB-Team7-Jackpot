import { useQuery } from '@tanstack/react-query';

import { getAccessToken } from '@/features/auth/libs/tokenStore';
import { apiClient } from '@/shared/api/apiClient';

export const useGetNickname = () => {
  return useQuery({
    queryKey: ['userInfo', 'nickname'],
    queryFn: () => apiClient.get({ endpoint: '/user/nickname' }),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!getAccessToken(),
    retry: false,
  });
};
