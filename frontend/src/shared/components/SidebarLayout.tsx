import type { ReactNode } from 'react';

import PageGlobalHeader from './PageGlobalHeader';

interface SidebarLayoutProps {
  headerSlot: ReactNode;
  sidebarSlot: ReactNode | boolean;
  children: ReactNode;
}

// 나중에 지금 root 태그에 원래 overflow-hidden이 있었는데 삭제했습니다.
// 문제가 되는 경우 다시 수정하겠습니다.

const SidebarLayout = ({
  headerSlot,
  sidebarSlot,
  children,
}: SidebarLayoutProps) => {
  return (
    <>
      <PageGlobalHeader />
      <div className='flex h-screen w-full max-w-screen min-w-[1700px] flex-col px-75'>
        <div className='flex-none'>{headerSlot}</div>
        <div className='flex min-h-0 w-full flex-1 flex-row items-start justify-center'>
          {typeof sidebarSlot !== typeof false && (
            <aside className='h-full w-[427px] flex-none'>{sidebarSlot}</aside>
          )}
          <main className='h-full flex-1'>{children}</main>
        </div>
      </div>
    </>
  );
};

export default SidebarLayout;
