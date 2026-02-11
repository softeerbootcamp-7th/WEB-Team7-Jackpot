import { apiClient } from '@/shared/api/apiClient';
import type { UserResponse } from '@/shared/types/userApi';

export const userInformation = {
  getNickname: async (): Promise<UserResponse> => {
    return await apiClient.get({ endpoint: '/user/nickname' });
  },
};
