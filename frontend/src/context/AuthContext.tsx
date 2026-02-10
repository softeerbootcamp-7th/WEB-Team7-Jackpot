import { createContext, useContext, useEffect, useState } from 'react';

import { authClient } from '@/features/auth/api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authClient.refresh();

        if (data.accessToken) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('자동 로그인 실패:', error);
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('로그인 전역 상태 문제 발생');
  return context;
};
