import { createContext } from 'react';

import { useInitAuth } from '@/features/auth/hooks/useInitAuth';

interface UserInfoType {
  nickname: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfoType;
  isLoading: boolean;
  // [윤종근] - TODO: 로그아웃 메서드 구현 필요
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isInitialized, isAuthenticated, userInfo, isLoading } = useInitAuth();
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userInfo, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
