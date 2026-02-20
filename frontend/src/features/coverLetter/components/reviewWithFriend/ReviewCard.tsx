import Avatar from '@/features/coverLetter/components/reviewWithFriend/Avatar';
import PaperChipIcon from '@/shared/icons/PaperChipIcon';
import PenToolIcon from '@/shared/icons/PenToolIcon';
import type { Review } from '@/shared/types/review';
import { getKoreanDate, getKoreanTime } from '@/shared/utils/dates';

interface ReviewCardProps {
  review: Review;
  selectedReviewId: number | null;
  onReviewClick: (reviewId: number) => void;
}

const ReviewCard = ({
  review,
  selectedReviewId,
  onReviewClick,
}: ReviewCardProps) => {
  const isSelected = selectedReviewId === review.id;
  const hasSuggestion = !!review.suggest;
  const hasComment = !!review.comment;

  const formattedDate = review.createdAt
    ? {
        date: getKoreanDate(review.createdAt),
        time: getKoreanTime(review.createdAt),
      }
    : null;

  return (
    <button
      type='button'
      onClick={() => onReviewClick(review.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onReviewClick(review.id);
        }
      }}
      className={`inline-flex cursor-pointer flex-col items-start justify-start gap-3 self-stretch border-b border-gray-100 p-5 shadow-[0px_0px_30px_0px_rgba(41,41,41,0.02)] transition-all duration-200 ${selectedReviewId && !isSelected ? 'opacity-30' : 'opacity-100'}`}
    >
      <div className='flex w-full flex-col items-start justify-start gap-4'>
        <div className='flex w-full items-start justify-between'>
          <div className='inline-flex flex-1 items-center justify-start gap-3'>
            <Avatar size='md' />
            <div className='inline-flex flex-1 flex-col items-start justify-center'>
              <div className='line-clamp-1 flex justify-start self-stretch text-base leading-6 font-bold text-gray-900'>
                {review.sender?.nickname}
              </div>
              {formattedDate && (
                <div className='inline-flex items-start justify-start gap-1'>
                  <div className='justify-start text-xs leading-5 font-normal text-gray-400'>
                    {formattedDate.date}
                  </div>
                  <div className='justify-start text-xs leading-5 font-normal text-gray-400'>
                    ·
                  </div>
                  <div className='justify-start text-xs leading-5 font-normal text-gray-400'>
                    {formattedDate.time}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='inline-flex items-center justify-start gap-1.5'>
          {hasSuggestion && (
            <div className='flex items-center justify-start gap-1 rounded-[100px] bg-red-50 py-[5px] pr-2.5 pl-2'>
              <PaperChipIcon />
              <div className='justify-start text-xs leading-5 font-medium text-red-600'>
                수정
              </div>
            </div>
          )}
          {hasComment && (
            <div className='flex items-center justify-start gap-1 rounded-[100px] bg-blue-50 py-[5px] pr-2.5 pl-2'>
              <PenToolIcon />
              <div className='justify-start text-xs leading-5 font-medium text-blue-600'>
                코멘트
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ReviewCard;
