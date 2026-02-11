import { createContext, useContext, useEffect, useState } from 'react';

import { authClient } from '@/features/auth/api/auth';
import { userInformation } from '@/shared/api/user';

interface UserInfoType {
  nickname: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  // 회원 정보를 가져올 때까지 기다리기 위해 비동기로 변경
  login: () => Promise<void>;
  userInfo: UserInfoType;
  // [윤종근] - TODO: 로그아웃 메서드 구현 필요
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
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

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('로그인 전역 상태 문제 발생');
  return context;
};
