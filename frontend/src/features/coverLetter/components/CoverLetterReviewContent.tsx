import { Suspense, useCallback, useEffect, useState } from 'react';

import { useParams } from 'react-router';

import CoverLetterSection from '@/features/coverLetter/components/CoverLetterSection';
import { useSharedLink } from '@/features/coverLetter/hooks/useCoverLetterQueries';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import SectionError from '@/shared/components/SectionError';

const CoverLetterReviewContent = ({
  isReviewActive,
  setIsReviewActive,
}: {
  isReviewActive: boolean;
  setIsReviewActive: (v: boolean) => void;
}) => {
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const { coverLetterId } = useParams();
  const id = Number(coverLetterId);
  const isValidId = !!coverLetterId && !Number.isNaN(id);

  const { data: sharedLink } = useSharedLink(id, isValidId);

  useEffect(() => {
    if (sharedLink?.active !== undefined) {
      setIsReviewActive(sharedLink.active);
    }
  }, [sharedLink?.active, setIsReviewActive]);

  const handleToggleReview = useCallback(
    (value: boolean) => {
      setIsReviewActive(value);
    },
    [setIsReviewActive],
  );

  const handleReviewClick = useCallback((reviewId: number | null) => {
    setSelectedReviewId(reviewId);
  }, []);

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
          setIsReviewActive={handleToggleReview}
          selectedReviewId={selectedReviewId}
          onReviewClick={handleReviewClick}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default CoverLetterReviewContent;
