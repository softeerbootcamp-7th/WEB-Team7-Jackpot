import { useEffect, useState } from 'react';

import { AUTH_API, AUTH_STORAGE } from '@/features/auth/constants';
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
  const { data: userInfo } = useGetNickname(!!accessToken);

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

      const isLoggedIn = localStorage.getItem(AUTH_STORAGE.KEYS.IS_LOGGED_IN);
      if (!isLoggedIn) {
        setIsInitialized(true);
        return;
      }
      try {
        const result = await refresh();
        if (result?.accessToken) {
          setAccessToken(result.accessToken);
        }
      } catch (error) {
        let isUnauthorized = false;

        // 취소 아니라 명확한 401 상태만을 찾음
        if (error instanceof Error) {
          isUnauthorized =
            // 서버가 토큰 만료를 알림
            error.message.includes(AUTH_API.STATUS_CODE.UNAUTHORIZED);
        }

        if (isUnauthorized) {
          // 서버가 명시적으로 토큰 만료를 알렸을 때 날림
          localStorage.removeItem(AUTH_STORAGE.KEYS.IS_LOGGED_IN);
        } else {
          // 새로고침 취소, 인터넷 끊김, 원인 불명의 통신 에러 등은 전부 무시
          // 스토리지를 날리지 않으니 새로고침 해도 로그인 유지됨
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [refresh]);

  return {
    isInitialized: isInitialized,
    isAuthenticated:
      !!accessToken ||
      localStorage.getItem(AUTH_STORAGE.KEYS.IS_LOGGED_IN) ===
        AUTH_STORAGE.VALUES.TRUE,
    userInfo: userInfo,
    isLoading: !isInitialized,
    login: onLoginSuccess,
    logout: onLogoutSuccess,
  };
};
