import { Outlet } from 'react-router';

import LibrarySideBar from '@/features/library/components/LibrarySideBar';
import { emptyCaseText } from '@/features/library/constants';
import { useLibraryListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';
import { useLibraryTabs } from '@/features/library/hooks/useLibraryTabs';
import EmptyCase from '@/shared/components/EmptyCase';

// 데이터 페칭 및 레이아웃을 반환합니다.
const LibrarySidebarLayout = () => {
  const { currentTab } = useLibraryTabs();

  const { data } = useLibraryListQueries(currentTab);

  const folderList = data?.folderList;

  if (!folderList || folderList.length === 0)
    return <EmptyCase {...emptyCaseText.overview} />;

  return (
    <div className='flex min-h-0 w-full flex-1 flex-row items-start justify-center'>
      <aside className='h-full w-[427px] flex-none'>
        <LibrarySideBar folderList={folderList} />
      </aside>
      <main className='h-full flex-1 overflow-hidden'>
        <Outlet />
      </main>
    </div>
  );
};

export default LibrarySidebarLayout;
