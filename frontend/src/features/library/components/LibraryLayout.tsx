import { Outlet } from 'react-router';

import ScrapNum from '@/features/library/components/ScrapNum';
import {
  libraryContent,
  libraryHeaderText,
} from '@/features/library/constants';
import { useLibraryTabs } from '@/features/library/hooks/useLibraryTabs';
import type { LibraryView } from '@/features/library/types';
import ContentHeader from '@/shared/components/ContentHeader';
import TabBar from '@/shared/components/TabBar';

const LibraryLayout = () => {
  const { currentTab, handleTabChange } = useLibraryTabs();

  return (
    <div className='flex h-[calc(100vh-6.25rem)] w-full max-w-screen min-w-[1700px] flex-col px-75'>
      <header>
        <ContentHeader {...libraryHeaderText} />
        <div className='flex flex-row items-center justify-between'>
          <TabBar<LibraryView>
            content={libraryContent}
            currentTab={currentTab}
            handleTabChange={handleTabChange}
          />
          <ScrapNum />
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export default LibraryLayout;
