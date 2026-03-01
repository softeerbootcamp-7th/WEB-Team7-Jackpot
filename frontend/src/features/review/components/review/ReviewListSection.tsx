import emptyReview from '@/assets/icons/emptyReview.svg';
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
    <div className='mx-[13px] flex h-full min-h-0 flex-col bg-white'>
      {reviews.length > 0 ? (
        <div className='min-h-0 flex-1 overflow-y-auto pb-80'>
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
        <div className='flex min-h-0 flex-1 items-center justify-center'>
          <img src={emptyReview} alt='빈 리뷰 아이콘' />
        </div>
      )}
    </div>
  );
};

export default ReviewListSection;
