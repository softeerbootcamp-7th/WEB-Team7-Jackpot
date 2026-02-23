import { useEffect, useState } from 'react';

import { Outlet, useOutletContext } from 'react-router';

import WriteSidebar from '@/features/coverLetter/components/sidebar/WriteSidebar';
import type { OutletContext } from '@/features/coverLetter/types/outletContext';

const WriteSidebarLayout = () => {
  const [currentSidebarTab, setCurrentSidebarTab] = useState<
    'scrap' | 'library'
  >('scrap');
  const { isReviewActive, setIsReviewActive } =
    useOutletContext<OutletContext>();

  useEffect(() => {
    return () => setIsReviewActive(false);
  }, [setIsReviewActive]);

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col'>
      <div className='flex min-h-0 w-full flex-1'>
        <aside className='h-full w-[427px] flex-1 flex-none overflow-hidden'>
          <WriteSidebar
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
