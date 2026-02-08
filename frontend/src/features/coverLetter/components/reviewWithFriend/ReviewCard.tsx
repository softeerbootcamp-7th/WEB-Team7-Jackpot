import type { Review } from '@/features/review/types/review';
import PaperChipIcon from '@/shared/icons/PaperChipIcon';
import PenToolIcon from '@/shared/icons/PenToolIcon';

interface ReviewCardProps {
  review: Review;
  selectedReviewId: string | null;
  onReviewClick: (reviewId: string) => void;
}

const ReviewCard = ({
  review,
  selectedReviewId,
  onReviewClick,
}: ReviewCardProps) => {
  const isSelected = selectedReviewId === review.id;
  const hasRevision = !!review.revision;
  const hasComment = !!review.comment;

  // createdAt 파싱
  const formattedDate = review.createdAt
    ? (() => {
        const date = new Date(review.createdAt);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const period = hours >= 12 ? '오후' : '오전';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

        return {
          date: `${month}월 ${day}일`,
          time: `${period} ${displayHours}:${minutes}`,
        };
      })()
    : null;

  return (
    <div
      onClick={() => onReviewClick(review.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onReviewClick(review.id);
        }
      }}
      role='button'
      tabIndex={0}
      className={`inline-flex cursor-pointer flex-col items-start justify-start gap-3 self-stretch border-b border-gray-100 p-5 shadow-[0px_0px_30px_0px_rgba(41,41,41,0.02)] transition-all duration-200 ${selectedReviewId && !isSelected ? 'opacity-30' : 'opacity-100'}`}
    >
      <div className='flex w-full flex-col items-start justify-start gap-4'>
        <div className='flex w-full items-start justify-between'>
          <div className='inline-flex flex-1 items-center justify-start gap-3'>
            <div className='relative h-12 w-12 overflow-hidden rounded-[100px] bg-purple-100'>
              <div className='absolute top-[33px] left-[3px] h-11 w-11 rounded-full bg-purple-300' />
              <div className='absolute top-[12px] left-[17px] h-4 w-4 rounded-full bg-purple-300' />
            </div>
            <div className='inline-flex flex-1 flex-col items-start justify-center'>
              <div className='line-clamp-1 justify-start self-stretch text-base leading-6 font-bold text-gray-900'>
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
          {hasRevision && (
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
    </div>
  );
};

export default ReviewCard;
