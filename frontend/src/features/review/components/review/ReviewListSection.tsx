import EmptyReview from '@/features/review/components/review/EmptyReview';
import ReviewCard from '@/features/review/components/review/ReviewCard';
import type { Review } from '@/features/review/types/review';

interface ReviewListSectionProps {
  reviews: Review[];
  editingReview: Review | null;
  onEditReview: (id: string) => void;
  onDeleteReview: (id: string) => void;
}

const ReviewListSection = ({
  reviews,
  editingReview,
  onEditReview,
  onDeleteReview,
}: ReviewListSectionProps) => {
  return (
    <div className='mx-[13px] flex w-[400px] flex-col items-start gap-0 overflow-hidden overflow-y-auto bg-white'>
      {reviews.length > 0 ? (
        <div className='pb-80'>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              editingReview={editingReview}
              handleEditReview={onEditReview}
              handleDeleteReview={onDeleteReview}
            />
          ))}
        </div>
      ) : (
        <EmptyReview />
      )}
    </div>
  );
};

export default ReviewListSection;
