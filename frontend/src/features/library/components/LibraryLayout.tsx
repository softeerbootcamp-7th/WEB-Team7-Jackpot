import type { ReactNode } from 'react';

interface LibraryLayoutProps {
  headerSlot: ReactNode;
  sidebarSlot: ReactNode;
  children: ReactNode;
}

const LibraryLayout = ({
  headerSlot,
  sidebarSlot,
  children,
}: LibraryLayoutProps) => {
  return (
    <div className='flex h-screen w-full max-w-screen min-w-[1700px] flex-col overflow-hidden px-75'>
      <div className='flex-none'>{headerSlot}</div>
      <div className='flex min-h-0 w-full flex-1 flex-row'>
        <aside className='h-full w-[427px] flex-none'>{sidebarSlot}</aside>
        <main className='h-full flex-1'>{children}</main>
      </div>
    </div>
  );
};

export default LibraryLayout;
