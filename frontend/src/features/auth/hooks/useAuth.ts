import { useContext } from 'react';

import { AuthContext } from '@/features/auth/context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('로그인 전역 상태 문제 발생');
  return context;
};
