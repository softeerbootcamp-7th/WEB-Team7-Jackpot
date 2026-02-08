import TrashCanIcon from '@/features/review/components/icons/TrashCanIcon';

const InvalidReviewBanner = ({
  originText,
  isExpanded,
}: {
  originText: string;
  isExpanded: boolean;
}) => {
  return (
    <div className='flex w-full flex-col gap-0.5 rounded-lg bg-purple-50 px-5 py-4'>
      <div className='flex items-center gap-2'>
        <div className='relative h-6 w-6 overflow-hidden'>
          <TrashCanIcon />
        </div>
        <div className='text-body-l font-bold text-purple-600'>
          이미 변경한 원문이에요!
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
