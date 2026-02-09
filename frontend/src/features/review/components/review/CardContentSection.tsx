import PaperChipIcon from '@/shared/icons/PaperChipIcon';
import PenToolIcon from '@/shared/icons/PenToolIcon';
import type { Review } from '@/shared/types/review';

const CardContentSection = ({
  text,
  review,
  isDetail,
}: {
  text: string;
  review: Review;
  isDetail: boolean;
}) => {
  if (!isDetail) {
    return (
      <p className='max-h-16 w-full overflow-hidden text-sm leading-6 font-normal text-gray-600'>
        {text}
      </p>
    );
  }

  return (
    <div className='flex w-full flex-col gap-4'>
      {review.revision && (
        <div className='flex w-full flex-col gap-1'>
          <div className='flex items-center gap-1.5'>
            <PaperChipIcon />
            <span className='text-body-l font-bold text-gray-950'>첨삭</span>
          </div>
          <p className='text-body-s pl-6 font-normal text-gray-600'>
            {review.revision}
          </p>
        </div>
      )}

      {review.comment && (
        <div className='flex w-full flex-col gap-1'>
          <div className='flex items-center gap-1.5'>
            <PenToolIcon />
            <span className='text-body-l font-bold text-gray-950'>코멘트</span>
          </div>
          <p className='text-body-s pl-6 font-normal text-gray-600'>
            {review.comment}
          </p>
        </div>
      )}
    </div>
  );
};

export default CardContentSection;
