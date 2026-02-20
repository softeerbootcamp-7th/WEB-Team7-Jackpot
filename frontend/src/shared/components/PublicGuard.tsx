import { Navigate, Outlet, useSearchParams } from 'react-router';

import { useAuth } from '@/features/auth/hooks/useAuth';

const PublicGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  if (isLoading) return null;

  if (isAuthenticated) {
    const redirect = searchParams.get('redirect');
    return <Navigate to={redirect || '/home'} replace />;
  }
  return <Outlet />;
};

export default PublicGuard;
