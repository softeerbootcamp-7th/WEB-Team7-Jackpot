import type { ReactNode } from 'react';

import { SharedIcons as SI } from '@/shared/icons';
import type { ReviewViewStatus } from '@/shared/types/review';

const STATUS_CONFIG: Partial<
  Record<
    ReviewViewStatus,
    { message: string; bgColor: string; textColor: string; icon: ReactNode }
  >
> = {
  PENDING_CHANGED: {
    message: '원문이 변경되어 첨삭 내용을 다시 확인해 주세요.',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    icon: <SI.ReviewMessageIcon className='h-5 w-5' />,
  },
  ACCEPTED: {
    message: '첨삭이 현재 원문에 적용된 상태예요.',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    icon: <SI.SaveCheckIcon className='h-5 w-5' />,
  },
  OUTDATED: {
    message: '첨삭 적용 이후 원문이 변경되었어요.',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    icon: <SI.ReviewMessageIcon className='h-5 w-5' />,
  },
  REVERT: {
    message: '첨삭 적용이 되돌려졌어요.',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    icon: <SI.ReviewMessageIcon className='h-5 w-5' />,
  },
};

const InvalidReviewBanner = ({
  viewStatus,
  originText,
  isExpanded,
}: {
  viewStatus: ReviewViewStatus;
  originText?: string;
  isExpanded: boolean;
}) => {
  const config = STATUS_CONFIG[viewStatus];
  if (!config) return null;

  return (
    <div
      className={`flex w-full flex-col gap-0.5 rounded-lg ${config.bgColor} px-5 py-4`}
    >
      <div className='flex items-center gap-2'>
        <div className={config.textColor}>{config.icon}</div>
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
