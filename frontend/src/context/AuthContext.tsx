import { createContext, useContext, useEffect, useState } from 'react';

import { authClient } from '@/features/auth/api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  // [윤종근] - TODO: 로그아웃 메서드 구현 필요
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // const initAuth = async () => {
    //   const success = await authClient.refresh();
    //   setIsAuthenticated(success);
    // };

    const initAuth = () => {
      const token = authClient.getToken();

      if (token) {
        setIsAuthenticated(true);
      }
    };

    initAuth();
  }, []);

  const login = (token: string) => {
    authClient.setToken(token);
    setIsAuthenticated(true);
  };

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
