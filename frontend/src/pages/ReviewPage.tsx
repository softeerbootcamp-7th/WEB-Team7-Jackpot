import { Suspense } from 'react';

import ReviewLayout from '@/features/review/components/ReviewLayout';
import { reviewHeaderText } from '@/features/review/constants';
import ContentHeader from '@/shared/components/ContentHeader';

const ReviewPage = () => {
  return (
    <div className='flex h-[calc(100vh-6.25rem)] w-full min-w-[1700px] flex-col px-75'>
      <ContentHeader {...reviewHeaderText} />

      <Suspense
        fallback={
          <div className='flex flex-1 items-center justify-center'>
            <span className='text-gray-400'>데이터를 불러오는 중...</span>
          </div>
        }
      >
        <ReviewLayout />
      </Suspense>
    </div>
  );
};

export default ReviewPage;
