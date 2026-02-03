interface LibraryLayoutProps {
  sidebarSlot: React.ReactNode;
  children: React.ReactNode;
}

const LibraryLayout = ({ sidebarSlot, children }: LibraryLayoutProps) => {
  return (
    <div className='flex h-full w-full flex-row overflow-hidden'>
      <aside className='w-[427px] overflow-hidden pt-0'>{sidebarSlot}</aside>
      <main>
        <div className='flex-1 overflow-hidden'>{children}</div>
      </main>
    </div>
  );
};

export default LibraryLayout;
