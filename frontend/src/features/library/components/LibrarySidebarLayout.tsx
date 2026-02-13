import { Outlet } from 'react-router';

import {
  MOCK_COVER_LETTER_FOLDERS,
  MOCK_QUESTION_FOLDERS,
} from '@/features/library/api/mockData';
import LibrarySideBar from '@/features/library/components/LibrarySideBar';
import { emptyCaseText } from '@/features/library/constants';
import { useLibraryListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';
import { useLibraryTabs } from '@/features/library/hooks/useLibraryTabs';
import EmptyCase from '@/shared/components/EmptyCase';

// [박소민] TODO: 지금 root 태그에 원래 overflow-hidden이 있었는데 삭제했습니다.
// 문제가 되는 경우 다시 수정하겠습니다.

const isDev = import.meta.env.DEV;

// 데이터 페칭 및 레이아웃을 반환합니다.
const LibrarySidebarLayout = () => {
  const { currentTab } = useLibraryTabs();

  const { data } = useLibraryListQueries(currentTab);

  const folderList =
    data?.folderList ??
    (isDev && currentTab === 'COMPANY'
      ? MOCK_COVER_LETTER_FOLDERS
      : MOCK_QUESTION_FOLDERS);

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
