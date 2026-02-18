import EmptyReview from '@/features/review/components/review/EmptyReview';
import ReviewCard from '@/features/review/components/review/ReviewCard';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { useDeleteReview } from '@/shared/hooks/useReviewQueries';
import type { Review } from '@/shared/types/review';

interface ReviewListSectionProps {
  reviews: Review[];
  editingReview: Review | null;
  qnaId: number;
  onEditReview: (id: number) => void;
}

const ReviewListSection = ({
  reviews,
  editingReview,
  qnaId,
  onEditReview,
}: ReviewListSectionProps) => {
  // API 호출만 수행하고, 삭제 결과는 WebSocket 이벤트로 수신하여 반영
  const { mutate: deleteReviewApi } = useDeleteReview(qnaId);
  const { showToast } = useToastMessageContext();

  const handleDelete = (reviewId: number) => {
    deleteReviewApi(reviewId, {
      onError: () => {
        showToast('리뷰 삭제에 실패했습니다.');
      },
    });
  };

  return (
    <div className='mx-[13px] flex h-full flex-col items-start gap-0 overflow-x-hidden overflow-y-auto bg-white'>
      {reviews.length > 0 ? (
        <div className='pb-80'>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              editingReview={editingReview}
              handleEditReview={onEditReview}
              handleDeleteReview={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className='flex h-full items-center justify-center'>
          <EmptyReview />
        </div>
      )}
    </div>
  );
};

export default ReviewListSection;
