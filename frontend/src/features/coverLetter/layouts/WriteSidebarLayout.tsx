import { useState } from 'react';

import { Outlet, useOutletContext } from 'react-router';

import CoverLetterWriteSidebar from '@/features/coverLetter/components/CoverLetterWriteSidebar';
import { coverLetterContent } from '@/features/coverLetter/constants';
import useCoverLetterParams from '@/features/coverLetter/hooks/useCoverLetterParams';
import TabBar from '@/shared/components/TabBar';

const WriteSidebarLayout = () => {
  const [currentSidebarTab, setCurrentSidebarTab] = useState<
    'scrap' | 'library'
  >('scrap');
  const { state, actions } = useCoverLetterParams();
  const { isReviewActive, setIsReviewActive } = useOutletContext<{
    isReviewActive: boolean;
    setIsReviewActive: (v: boolean) => void;
  }>();

  return (
    <div className='flex w-full flex-1 flex-col'>
      <TabBar
        content={coverLetterContent}
        handleTabChange={actions.handleTabChange}
        currentTab={state.currentTab}
      />
      <div className='flex min-h-0 w-full flex-1'>
        <aside className='h-full w-[427px] flex-none overflow-hidden'>
          <CoverLetterWriteSidebar
            currentSidebarTab={currentSidebarTab}
            onTabChange={setCurrentSidebarTab}
          />
        </aside>
        <main className='h-full min-w-0 flex-1'>
          <Outlet context={{ isReviewActive, setIsReviewActive }} />
        </main>
      </div>
    </div>
  );
};

export default WriteSidebarLayout;
