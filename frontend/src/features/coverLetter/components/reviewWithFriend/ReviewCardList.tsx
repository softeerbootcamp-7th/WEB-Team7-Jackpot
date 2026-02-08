// features/coverLetter/components/reviewWithFriend/ReviewCardList.tsx
import ReviewCard from '@/features/coverLetter/components/reviewWithFriend/ReviewCard';
import type { Review } from '@/features/review/types/review';

interface ReviewCardListProps {
  reviews: Review[];
  selectedReviewId: string | null;
  onReviewClick: (reviewId: string) => void;
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
