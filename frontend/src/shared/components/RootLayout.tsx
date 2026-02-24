import { useEffect } from 'react';

import { Outlet } from 'react-router';

import PageGlobalHeader from '@/shared/components/PageGlobalHeader';
import { useSSE } from '@/shared/hooks/useSSE';

const RootLayout = () => {
  useSSE();

  useEffect(() => {
    // RootLayout이 렌더링되는 서비스 페이지 진입 시 html에 클래스 추가
    document.documentElement.classList.add('stable-layout');

    // 컴포넌트가 사라질 때(랜딩으로 나갈 때) 클래스 제거
    return () => {
      document.documentElement.classList.remove('stable-layout');
    };
  }, []);
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
