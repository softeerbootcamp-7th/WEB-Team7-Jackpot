import CoverLetter from '@/features/coverLetter/components/CoverLetter';
import ReviewCardList from '@/features/coverLetter/components/reviewWithFriend/ReviewCardList';
import { useCoverLetterWithQnAIds } from '@/shared/hooks/useCoverLetterQueries';
import { useQnAList } from '@/shared/hooks/useQnAQueries';
import useReviewState from '@/shared/hooks/useReviewState';

interface CoverLetterSectionProps {
  id: number;
  isReviewActive: boolean;
  setIsReviewActive: (v: boolean) => void;
  selectedReviewId: number | null;
  onReviewClick: (reviewId: number | null) => void;
}

const CoverLetterSection = ({
  id,
  isReviewActive,
  setIsReviewActive,
  selectedReviewId,
  onReviewClick,
}: CoverLetterSectionProps) => {
  const { coverLetter, qnaIds } = useCoverLetterWithQnAIds(id);
  const { data: qnas } = useQnAList(qnaIds ?? []);

  const reviewState = useReviewState(coverLetter, qnas);

  const hasQnas = qnas && qnas.length > 0;

  if (!hasQnas || !coverLetter) {
    return (
      <div className='flex h-full items-center justify-center text-gray-400'>
        문항이 없습니다.
      </div>
    );
  }

  return (
    <div className='flex h-full min-h-0 w-full min-w-0 flex-row pb-39.5'>
      <div className='h-full min-h-0 min-w-0 flex-1 overflow-hidden'>
        <CoverLetter
          key={reviewState.currentPageIndex}
          documentId={id}
          openReview={setIsReviewActive}
          isReviewOpen={isReviewActive}
          selectedReviewId={selectedReviewId}
          onReviewClick={onReviewClick}
          reviewState={reviewState}
        />
      </div>

      {isReviewActive && (
        <aside className='h-full min-h-0 w-[248px] overflow-y-auto border-l border-gray-100'>
          <ReviewCardList
            reviews={reviewState.currentReviews}
            selectedReviewId={selectedReviewId}
            onReviewClick={onReviewClick}
          />
        </aside>
      )}
    </div>
  );
};

export default CoverLetterSection;
