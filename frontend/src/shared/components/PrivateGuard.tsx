import { useEffect } from 'react';

import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';

const PrivateGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { showToast } = useToastMessageContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showToast('로그인이 필요한 페이지입니다.', false);
    }
  }, [isLoading, isAuthenticated, showToast]);

  if (isLoading) return null;

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return <Outlet />;
};

export default PrivateGuard;
