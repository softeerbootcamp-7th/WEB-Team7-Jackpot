import ReviewCard from '@/features/coverLetter/components/reviewWithFriend/ReviewCard';
import type { Review } from '@/shared/types/review';

interface ReviewCardListProps {
  reviews: Review[];
  selectedReviewId: number | null;
  onReviewClick: (reviewId: number) => void;
}

const ReviewCardList = ({
  reviews,
  selectedReviewId,
  onReviewClick,
}: ReviewCardListProps) => {
  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            selectedReviewId={selectedReviewId}
            onReviewClick={onReviewClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewCardList;
