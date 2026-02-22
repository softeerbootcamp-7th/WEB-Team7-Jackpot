import Avatar from '@/features/coverLetter/components/reviewWithFriend/Avatar';
import InvalidReviewBanner from '@/shared/components/InvalidReviewBanner';
import { SharedIcons as SI } from '@/shared/icons';
import type { Review } from '@/shared/types/review';

interface ReviewModalProps {
  review: Review | null;
  initialSuggest?: string;
  initialComment?: string;
  onDelete?: (reviewId: number) => void;
  onToggleApproval?: (reviewId: number) => void;
}

const ReviewModal = ({
  review,
  initialSuggest,
  initialComment,
  onDelete,
  onToggleApproval,
}: ReviewModalProps) => {
  const viewStatus = review?.viewStatus ?? 'PENDING';
  const isPending = viewStatus === 'PENDING';
  const isAccepted = viewStatus === 'ACCEPTED';
  const canToggle =
    !!review?.suggest && !!onToggleApproval && (isPending || isAccepted);
  const displayOriginText = isAccepted
    ? (review?.suggest ?? review?.originText ?? '')
    : (review?.originText ?? '');
  const displaySuggest = isAccepted
    ? (review?.originText ?? '')
    : (initialSuggest ?? '');

  return (
    <div className='flex w-96 flex-col items-end gap-4 rounded-[32px] bg-white p-5 shadow-[0px_0px_30px_0px_rgba(41,41,41,0.06)]'>
      <div className='flex flex-col items-start justify-start gap-4 self-stretch'>
        <div className='inline-flex items-center justify-start gap-3 self-stretch'>
          <div className='flex flex-1 items-center justify-start gap-2'>
            <div className='flex flex-1 items-center justify-start gap-2'>
              <Avatar size='sm' />
              <div className='text-Semantic-text-headline line-clamp-1 justify-start text-base leading-6 font-bold'>
                {review?.sender?.nickname || '익명'}
              </div>
            </div>
          </div>
        </div>
        {!isPending && review && (
          <InvalidReviewBanner
            viewStatus={viewStatus}
            isExpanded={true}
            originText={displayOriginText}
          />
        )}
        <div className='flex flex-col items-start justify-start gap-4 self-stretch'>
          <div className='flex flex-col items-start justify-start gap-1 self-stretch'>
            <div className='inline-flex items-center justify-center gap-1.5'>
              <SI.PaperChipIcon />
              <div className='text-Semantic-text-headline justify-start text-base leading-6 font-bold'>
                수정
              </div>
            </div>
            <div className='inline-flex items-center justify-center gap-2.5 self-stretch pl-6'>
              <div className='text-Primitive-Color-gray-gray-800 flex-1 justify-start text-sm leading-5 font-normal'>
                {displaySuggest}
              </div>
            </div>
          </div>
          <div className='flex flex-col items-start justify-start gap-1 self-stretch'>
            <div className='inline-flex items-center justify-center gap-1.5'>
              <SI.PenToolIcon />
              <div className='text-Semantic-text-headline justify-start text-base leading-6 font-bold'>
                코멘트
              </div>
            </div>
            <div className='inline-flex items-center justify-center gap-2.5 self-stretch pl-6'>
              <div className='text-Semantic-text-label-600 flex-1 justify-start text-sm leading-5 font-normal'>
                {initialComment}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='inline-flex items-center justify-between self-stretch'>
        <div className='flex items-center justify-start gap-1.5'>
          <div className='flex h-7 w-7 items-center justify-center gap-1 rounded-[100px] bg-red-50 px-2 py-[5px]'>
            <SI.PaperChipIcon />
          </div>
          <div className='flex h-7 w-7 items-center justify-center gap-1 rounded-[100px] bg-blue-50 px-2 py-[5px]'>
            <SI.PenToolIcon />
          </div>
        </div>
        <div className='flex items-center justify-start gap-2'>
          {onDelete && (
            <button
              type='button'
              className='flex cursor-pointer items-center justify-start gap-1 rounded-xl px-3 py-1.5'
              onClick={() => review && onDelete?.(review.id)}
            >
              <span className='text-center text-sm leading-5 font-medium text-red-600'>
                삭제하기
              </span>
            </button>
          )}
          {canToggle && (
            <button
              type='button'
              className='flex cursor-pointer items-center justify-start gap-1 rounded-xl bg-gray-900 px-3 py-1.5 text-white'
              onClick={() => review && onToggleApproval?.(review.id)}
            >
              <span className='text-center text-sm leading-5 font-bold'>
                {isPending ? '적용하기' : '되돌리기'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
