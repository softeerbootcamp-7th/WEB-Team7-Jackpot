import { Suspense } from 'react';

import CoverLetterOverviewSkeleton from '@/features/home/components/CoverLetterOverviewSkeleton';
import HomeSectionError from '@/features/home/components/HomeSectionError';
import ScheduleOverview from '@/features/home/components/ScheduleOverview';
import SummaryOverview from '@/features/home/components/SummaryOverview';
import SummaryOverviewSkeleton from '@/features/home/components/SummaryOverviewSkeleton';
import UpcomingSchedulesSkeleton from '@/features/home/components/UpcomingSchedulesSkeleton';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import RightArrow from '@/shared/icons/RightArrow';

const HomePage = () => {
  return (
    <div className='flex min-h-screen w-full min-w-[1700px] flex-col overflow-x-hidden overflow-y-auto'>
      <div className='flex flex-1 flex-col gap-10 px-[18.75rem] pb-[1.125rem]'>
        <img
          className='h-96 w-full rounded-2xl'
          src='/images/banner.png'
          alt='홈 화면 배너'
        />

        <ErrorBoundary fallback={<HomeSectionError />}>
          <Suspense fallback={<SummaryOverviewSkeleton />}>
            <SummaryOverview />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<HomeSectionError />}>
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
        </ErrorBoundary>

        <ErrorBoundary fallback={<HomeSectionError />}>
          <Suspense fallback={<CoverLetterOverviewSkeleton len={6} />}>
            <CoverLetterOverview
              button={<RightArrow />}
              len={6}
              showEmptyState
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default HomePage;
