import { createContext } from 'react';

import { useInitAuth } from '@/features/auth/hooks/useInitAuth';
import type { UserInfoType } from '@/features/auth/types/user';
interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfoType | undefined;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isInitialized, isAuthenticated, userInfo, isLoading, login, logout } =
    useInitAuth();
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userInfo,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
