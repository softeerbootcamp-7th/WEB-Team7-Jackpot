import { useCallback, useState } from 'react';

import CoverLetter from '@/features/coverLetter/components/CoverLetter';
import ReviewCardList from '@/features/coverLetter/components/reviewWithFriend/ReviewCardList';
import useReviewState from '@/shared/hooks/useReviewState';

const CoverLetterReviewContent = ({
  selectedDocumentId,
  isReviewOpen,
  setIsReviewOpen,
}: {
  selectedDocumentId: number;
  isReviewOpen: boolean;
  setIsReviewOpen: (value: boolean) => void;
}) => {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const reviewState = useReviewState(selectedDocumentId);

  const handleReviewClick = useCallback((reviewId: string | null) => {
    setSelectedReviewId(reviewId);
  }, []);

  return (
    <div className='flex h-full w-full min-w-0 flex-row pb-39.5'>
      <div className='h-full min-w-0 flex-1'>
        <CoverLetter
          key={reviewState.currentPageIndex}
          documentId={selectedDocumentId}
          openReview={setIsReviewOpen}
          isReviewOpen={isReviewOpen}
          selectedReviewId={selectedReviewId}
          onReviewClick={handleReviewClick}
          reviewState={reviewState}
        />
      </div>

      {isReviewOpen && (
        <aside className='w-[248px] border-l border-gray-100'>
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
