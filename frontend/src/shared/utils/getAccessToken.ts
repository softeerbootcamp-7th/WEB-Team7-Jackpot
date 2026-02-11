import { authClient } from '@/features/auth/api/auth';

export const getAccessToken = () => {
  return authClient.getToken();
};
