import { useEffect, useState } from 'react';

import { useRefresh } from '@/features/auth/hooks/useAuthClient';
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken as setInMemoryToken,
} from '@/features/auth/libs/tokenStore';
import { useGetNickname } from '@/shared/hooks/useUserInfo';

export const useInitAuth = () => {
  const { mutateAsync: refresh } = useRefresh();
  // 토큰을 확인하는 중인지 체크하는 상태 값
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(
    getAccessToken(),
  );
  const { data: userInfo, isLoading: isUserInfoLoading } =
    useGetNickname(!!accessToken);

  const onLoginSuccess = (newToken: string) => {
    // 인메모리 저장 (API용)
    setInMemoryToken(newToken);
    // 리액트 상태 업데이트 (화면 갱신용)
    setAccessToken(newToken);
  };

  const onLogoutSuccess = () => {
    removeAccessToken();
    setAccessToken('');
  };

  useEffect(() => {
    const initAuth = async () => {
      const currentToken = getAccessToken();
      if (currentToken) {
        setAccessToken(currentToken);
        setIsInitialized(true);
        return;
      }

      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        setIsInitialized(true);
        return;
      }
      try {
        const result = await refresh();
        if (result?.accessToken) {
          setAccessToken(result.accessToken);
        }
      } catch {
        localStorage.removeItem('isLoggedIn');
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
    login: onLoginSuccess,
    logout: onLogoutSuccess,
  };
};
