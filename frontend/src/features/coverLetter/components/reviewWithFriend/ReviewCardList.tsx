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
  // 유효한 리뷰만 필터링
  const validReviews = reviews.filter((review) => review.isValid !== false);

  if (validReviews.length === 0) {
    return (
      <div className='flex h-full items-center justify-center p-8'>
        <p className='text-sm text-gray-400'>아직 받은 첨삭이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col overflow-y-auto pb-80'>
      {validReviews.map((review) => (
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
