import { Suspense } from 'react';

import CoverLetterOverviewSkeleton from '@/features/home/components/CoverLetterOverviewSkeleton';
import HomeCoverLetterSection from '@/features/home/components/HomeCoverLetterSection';
import ScheduleOverview from '@/features/home/components/ScheduleOverview';
import SummaryOverview from '@/features/home/components/SummaryOverview';
import SummaryOverviewSkeleton from '@/features/home/components/SummaryOverviewSkeleton';
import UpcomingSchedulesSkeleton from '@/features/home/components/upcomingSchedule/UpcomingSchedulesSkeleton';

const HomePage = () => {
  return (
    <div className='flex min-h-screen w-full min-w-[1700px] flex-col overflow-x-hidden overflow-y-auto'>
      <div className='flex flex-1 flex-col gap-10 px-[18.75rem] pb-[3.125rem]'>
        <img
          className='h-96 w-full rounded-2xl'
          src='/images/banner.png'
          alt='홈 화면 배너'
        />

        <Suspense fallback={<SummaryOverviewSkeleton />}>
          <SummaryOverview />
        </Suspense>

        <Suspense
          fallback={
            <div className='inline-flex w-full items-center justify-start gap-16'>
              <div className='h-[270px] w-[426px] animate-pulse rounded-2xl bg-gray-100' />
              <UpcomingSchedulesSkeleton />
            </div>
          }
        >
          <ScheduleOverview />
        </Suspense>

        <Suspense fallback={<CoverLetterOverviewSkeleton len={6} />}>
          <HomeCoverLetterSection />
        </Suspense>
      </div>
    </div>
  );
};

export default HomePage;
