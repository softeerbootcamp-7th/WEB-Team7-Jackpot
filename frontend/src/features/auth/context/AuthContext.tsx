import { createContext } from 'react';

import { useInitAuth } from '@/features/auth/hooks/useInitAuth';

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

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isInitialized, isAuthenticated, login, userInfo } = useInitAuth();
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
