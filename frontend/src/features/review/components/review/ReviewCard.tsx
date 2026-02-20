import { useState } from 'react';

import ActionButtons from '@/features/review/components/review/ActionButtons';
import CardContentSection from '@/features/review/components/review/CardContentSection';
import CardUserInfo from '@/features/review/components/review/CardUserInfo';
import ChipRow from '@/features/review/components/review/ChipRow';
import ChevronIcon from '@/features/review/icons/ChevronIcon';
import InvalidReviewBanner from '@/shared/components/InvalidReviewBanner';
import type { Review } from '@/shared/types/review';

interface ReviewCardProps {
  review: Review;
  editingReview: Review | null;
  handleEditReview: (id: number) => void;
  handleDeleteReview: (id: number) => void;
}

const ReviewCard = ({
  review,
  editingReview,
  handleEditReview,
  handleDeleteReview,
}: ReviewCardProps) => {
  const [isDetail, setIsDetail] = useState(false);
  const hasEdit = !!review.revision;
  const hasComment = !!review.comment;
  const viewStatus = review.viewStatus ?? 'PENDING';
  const showBanner = viewStatus !== 'PENDING';

  return (
    <div
      className={`flex w-96 flex-col gap-3 border-b border-gray-100 p-5 transition-opacity duration-200 ${
        editingReview?.id === review.id || editingReview === null
          ? 'opacity-100'
          : 'opacity-30'
      }`}
    >
      <div className='flex w-full flex-col gap-4'>
        <div className='flex w-full items-start justify-between gap-5'>
          <div className='flex flex-1 items-center gap-3'>
            <CardUserInfo
              name={review.sender?.nickname ?? '익명'}
              dateTime={review.createdAt ?? ''}
            />
          </div>
          <div className='py-0.5'>
            <ChevronIcon
              isDetail={isDetail}
              handleShowDetail={() => setIsDetail((prev) => !prev)}
            />
          </div>
        </div>

        <div className='flex w-full flex-col gap-4'>
          {showBanner && (
            <InvalidReviewBanner
              viewStatus={viewStatus}
              isExpanded={isDetail}
              originText={review.selectedText}
            />
          )}
          <CardContentSection
            text={review.selectedText}
            review={review}
            isDetail={isDetail}
          />

          <div className='flex w-full items-center justify-between'>
            <ChipRow hasEdit={hasEdit} hasComment={hasComment} />
            <ActionButtons
              reviewId={review.id}
              handleEditReview={handleEditReview}
              handleDeleteReview={handleDeleteReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
