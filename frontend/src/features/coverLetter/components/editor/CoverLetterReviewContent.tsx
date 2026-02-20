import { Suspense, useEffect } from 'react';

import { useOutletContext, useParams } from 'react-router';

import CoverLetterSection from '@/features/coverLetter/components/editor/CoverLetterSection';
import { useSharedLink } from '@/features/coverLetter/hooks/useCoverLetterQueries';
import type { OutletContext } from '@/features/coverLetter/types/outletContext';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import SectionError from '@/shared/components/SectionError';

const CoverLetterReviewContent = () => {
  const { isReviewActive, setIsReviewActive } =
    useOutletContext<OutletContext>();
  const { coverLetterId } = useParams();
  const id = Number(coverLetterId);
  const isValidId = !!coverLetterId && !Number.isNaN(id);

  const { data: sharedLink } = useSharedLink(id, isValidId);

  useEffect(() => {
    if (sharedLink?.active !== undefined) {
      setIsReviewActive(sharedLink.active);
    }
  }, [sharedLink?.active, setIsReviewActive]);

  if (!isValidId) {
    return <SectionError text='잘못된 자기소개서 ID입니다' />;
  }

  return (
    <ErrorBoundary
      fallback={(reset) => (
        <SectionError onRetry={reset} text='QnA를 표시할 수 없습니다' />
      )}
    >
      <Suspense fallback={<div>로딩 중...</div>}>
        <CoverLetterSection
          id={id}
          isReviewActive={isReviewActive}
          setIsReviewActive={setIsReviewActive}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default CoverLetterReviewContent;
