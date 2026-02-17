import TrashCanIcon from '@/features/review/icons/TrashCanIcon';
import type { ReviewViewStatus } from '@/shared/types/review';

const STATUS_CONFIG: Record<
  string,
  { message: string; bgColor: string; textColor: string }
> = {
  PENDING_CHANGED: {
    message: '원문이 수정되어 첨삭 내용과 달라졌어요.',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
  },
  ACCEPTED: {
    message: '현재 원문에 적용된 첨삭이에요.',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  OUTDATED: {
    message: '적용 후 원문이 변경되었어요.',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
};

const InvalidReviewBanner = ({
  viewStatus,
  originText,
  isExpanded,
}: {
  viewStatus: ReviewViewStatus;
  originText: string;
  isExpanded: boolean;
}) => {
  const config = STATUS_CONFIG[viewStatus];
  if (!config) return null;

  return (
    <div
      className={`flex w-full flex-col gap-0.5 rounded-lg ${config.bgColor} px-5 py-4`}
    >
      <div className='flex items-center gap-2'>
        <div className='relative h-6 w-6 overflow-hidden'>
          <TrashCanIcon />
        </div>
        <div className={`text-body-l font-bold ${config.textColor}`}>
          {config.message}
        </div>
      </div>

      {isExpanded && (
        <div className='flex items-center gap-2.5 pl-8'>
          <div className='text-caption-l line-clamp-2 max-h-10 flex-1 font-normal text-gray-400'>
            {originText}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvalidReviewBanner;
