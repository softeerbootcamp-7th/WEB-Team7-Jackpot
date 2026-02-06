import TrashCanIcon from '@/features/review/components/icons/TrashCanIcon';

// InvalidReviewBanner.tsx (새 컴포넌트)
const InvalidReviewBanner = ({
  originText,
  isExpanded,
}: {
  originText: string;
  isExpanded: boolean;
}) => {
  return (
    <div className='flex flex-col gap-0.5 rounded-lg bg-purple-50 px-5 py-4'>
      <div className='flex items-center gap-2'>
        <div className='relative h-6 w-6 overflow-hidden'>
          <TrashCanIcon />
        </div>
        <div className='text-base leading-6 font-bold text-purple-600'>
          이미 변경한 원문이에요!
        </div>
      </div>

      {isExpanded && (
        <div className='flex items-center gap-2.5 pl-8'>
          <div className='line-clamp-2 max-h-10 flex-1 text-xs leading-5 font-normal text-gray-400'>
            {originText}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvalidReviewBanner;
