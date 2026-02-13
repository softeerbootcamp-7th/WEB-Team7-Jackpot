import { useEffect, useState } from 'react';

import { authClient } from '@/features/auth/api/auth';
import { userInformation } from '@/shared/api/user';

interface UserInfoType {
  nickname: string;
}

export const useInitAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // 토큰을 확인하는 중인지 체크하는 상태 값
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfoType>({ nickname: '' });

  const fetchUserInfo = async () => {
    try {
      const data = await userInformation.getNickname();
      setUserInfo({ nickname: data.nickname });
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authClient.refresh();

        if (data.accessToken) {
          setIsAuthenticated(true);
          await fetchUserInfo();
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('자동 로그인 실패:', error);
        setIsAuthenticated(false);
        setUserInfo({ nickname: '' });
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    setIsAuthenticated(true);
    await fetchUserInfo();
  };

  return {
    isInitialized: isInitialized,
    isAuthenticated: isAuthenticated,
    login: login,
    userInfo: userInfo,
  };
};
