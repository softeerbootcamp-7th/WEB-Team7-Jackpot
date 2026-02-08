import PaperChipIcon from '@/shared/icons/PaperChipIcon';
import PenToolIcon from '@/shared/icons/PenToolIcon';

const ReviewCard = () => {
  return (
    <div className='inline-flex flex-col items-start justify-start gap-3 self-stretch border-b border-gray-100 p-5 shadow-[0px_0px_30px_0px_rgba(41,41,41,0.02)]'>
      <div className='flex flex-col items-start justify-start gap-4 self-stretch'>
        <div className='inline-flex w-52 items-center justify-start gap-3'>
          <div className='relative h-12 w-12 overflow-hidden rounded-[100px] bg-purple-100'>
            <div className='absolute top-[33px] left-[3px] h-11 w-11 rounded-full bg-purple-300' />
            <div className='absolute top-[12px] left-[17px] h-4 w-4 rounded-full bg-purple-300' />
          </div>
          <div className='inline-flex flex-1 flex-col items-start justify-center'>
            <div className='line-clamp-1 justify-start self-stretch text-base leading-6 font-bold text-gray-900'>
              열받은 아델리펭귄
            </div>
            <div className='inline-flex items-start justify-start gap-1'>
              <div className='justify-start text-xs leading-5 font-normal text-gray-400'>
                01월 15일
              </div>
              <div className='justify-start text-xs leading-5 font-normal text-gray-400'>
                ·
              </div>
              <div className='justify-start text-xs leading-5 font-normal text-gray-400'>
                오후 5:30
              </div>
            </div>
          </div>
        </div>
        <div className='inline-flex items-center justify-start gap-1.5'>
          <div className='flex items-center justify-start gap-1 rounded-[100px] bg-red-50 py-[5px] pr-2.5 pl-2'>
            <PaperChipIcon />
            <div className='justify-start text-xs leading-5 font-medium text-red-600'>
              수정
            </div>
          </div>
          <div className='flex items-center justify-start gap-1 rounded-[100px] bg-blue-50 py-[5px] pr-2.5 pl-2'>
            <PenToolIcon />
            <div className='justify-start text-xs leading-5 font-medium text-blue-600'>
              코멘트
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
