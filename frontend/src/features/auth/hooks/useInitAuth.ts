import { useEffect, useState } from 'react';

import { getAccessToken } from '../libs/tokenStore';

import { useRefresh } from '@/features/auth/hooks/useAuthClient';
import { useGetNickname } from '@/shared/hooks/useUserInfo';

export const useInitAuth = () => {
  const { data: userInfo, isLoading: isUserInfoLoading } = useGetNickname();
  const { mutateAsync: refresh } = useRefresh();
  // 토큰을 확인하는 중인지 체크하는 상태 값
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      if (getAccessToken()) {
        setIsInitialized(true);
        return;
      }
      try {
        await refresh();
      } catch (error) {
        console.error('자동 로그인 실패 (세션 만료):', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [refresh]);

  return {
    isInitialized: isInitialized,
    isAuthenticated: !!userInfo,
    userInfo: userInfo,
    isLoading: isUserInfoLoading,
  };
};
