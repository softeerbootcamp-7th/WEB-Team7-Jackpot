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
    <div className='flex h-full flex-col overflow-y-auto pb-80'>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          selectedReviewId={selectedReviewId}
          onReviewClick={onReviewClick}
        />
      ))}
    </div>
  );
};

export default ReviewCardList;
