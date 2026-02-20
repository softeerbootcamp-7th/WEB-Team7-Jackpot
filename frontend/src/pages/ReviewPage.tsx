import { Suspense } from 'react';

import ReviewLayout from '@/features/review/components/ReviewLayout';
import { reviewHeaderText } from '@/features/review/constants';
import ContentHeader from '@/shared/components/ContentHeader';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import SectionError from '@/shared/components/SectionError';

const ReviewPage = () => {
  return (
    <div className='flex h-[calc(100vh-6.25rem)] w-full min-w-[1700px] flex-col px-75'>
      <ContentHeader {...reviewHeaderText} />

      <ErrorBoundary
        fallback={(resetErrorBoundary) => (
          <SectionError
            text='데이터를 불러오는 중 오류가 발생했습니다.'
            onRetry={resetErrorBoundary}
          />
        )}
      >
        <Suspense
          fallback={
            <div className='flex flex-1 items-center justify-center'>
              <span className='text-gray-400'>데이터를 불러오는 중...</span>
            </div>
          }
        >
          <ReviewLayout />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default ReviewPage;
