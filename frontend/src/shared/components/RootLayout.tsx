import { Outlet } from 'react-router';

import PageGlobalHeader from '@/shared/components/PageGlobalHeader';
import { useSSE } from '@/shared/hooks/useSSE';

const RootLayout = () => {
  useSSE()
  return (
    <div>
      <PageGlobalHeader />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
