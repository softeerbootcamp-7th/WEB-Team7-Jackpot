import type { ReactNode } from 'react';

interface SidebarLayoutProps {
  headerSlot: ReactNode;
  sidebarSlot: ReactNode;
  children: ReactNode;
  isReviewOpen?: boolean;
}

// [박소민] TODO: 지금 root 태그에 원래 overflow-hidden이 있었는데 삭제했습니다.
// 문제가 되는 경우 다시 수정하겠습니다.

const SidebarLayout = ({
  headerSlot,
  sidebarSlot,
  children,
  isReviewOpen,
}: SidebarLayoutProps) => {
  return (
    <div
      className={`flex h-[calc(100vh-6.25rem)] w-full min-w-[1700px] flex-col ${isReviewOpen ? 'pl-75' : 'px-75'}`}
    >
      <div className='flex-none'>{headerSlot}</div>

      <div className='flex min-h-0 w-full flex-1'>
        <aside className='h-full w-[427px] flex-none overflow-hidden'>
          {sidebarSlot}
        </aside>

        <main className='h-full min-w-0 flex-1'>{children}</main>
      </div>
    </div>
  );
};

export default SidebarLayout;
