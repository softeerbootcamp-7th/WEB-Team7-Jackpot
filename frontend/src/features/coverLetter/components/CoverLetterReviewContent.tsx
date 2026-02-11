import { useCallback, useState } from 'react';

import CoverLetter from '@/features/coverLetter/components/CoverLetter';
import ReviewCardList from '@/features/coverLetter/components/reviewWithFriend/ReviewCardList';
import useReviewState from '@/shared/hooks/useReviewState';

const CoverLetterReviewContent = ({
  selectedDocumentId,
  isReviewActive,
  setIsReviewActive,
}: {
  selectedDocumentId: number;
  isReviewActive: boolean;
  setIsReviewActive: (v: boolean) => void;
}) => {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const reviewState = useReviewState(selectedDocumentId);

  const handleReviewClick = useCallback((reviewId: string | null) => {
    setSelectedReviewId(reviewId);
  }, []);

  return (
    <div className='flex h-full min-h-0 w-full min-w-0 flex-row pb-39.5'>
      <div className='h-full min-h-0 min-w-0 flex-1 overflow-hidden'>
        <CoverLetter
          key={reviewState.currentPageIndex}
          documentId={selectedDocumentId}
          openReview={setIsReviewActive}
          isReviewOpen={isReviewActive}
          selectedReviewId={selectedReviewId}
          onReviewClick={handleReviewClick}
          reviewState={reviewState}
        />
      </div>

      {isReviewActive && (
        <aside className='h-full min-h-0 w-[248px] overflow-y-auto border-l border-gray-100'>
          <ReviewCardList
            reviews={reviewState.currentReviews}
            selectedReviewId={selectedReviewId}
            onReviewClick={handleReviewClick}
          />
        </aside>
      )}
    </div>
  );
};

export default CoverLetterReviewContent;
