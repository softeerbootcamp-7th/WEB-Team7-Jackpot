import { UploadPageIcons as I } from '@/components/upload/icons';

const CoverLetterContentArea = () => {
  return (
    <div className='flex-2'>
      <div>
        <div className='flex gap-3 items-center'>
          <div className='px-4 py-2 bg-gray-50 rounded-md text-gray-600 font-bold text-[15px] select-none'>
            1
          </div>
          <div className='font-bold text-lg text-gray-950'>
            인생에서 가장 누워서 자고 싶었던 경험은 무엇이고 어떻게
            극복하셨나요?
          </div>
        </div>
        <div className='flex flex-col gap-3 pl-13'>
          <div className='text-sm text-gray-400'>총 1,038자</div>
          <div className='text-sm text-gray-600'>대학 시절 ...</div>
        </div>
      </div>
      <div className='flex gap-5 justify-self-center'>
        <button className='rounded-[7px] bg-gray-50 p-2 cursor-pointer'>
          <I.LeftPaginationButtonIcon color='#D9D9D9' />
        </button>
        <div className='flex gap-[10px] font-bold text-lg select-none'>
          <div className='text-purple-500'>1</div>
          <div className='text-gray-400'>/</div>
          <div className='text-gray-400'>3</div>
        </div>
        <button className='rounded-[7px] bg-purple-50 p-2 cursor-pointer'>
          <I.RightPaginationButtonIcon color='var(--color-purple-200)' />
        </button>
      </div>
    </div>
  );
};

export default CoverLetterContentArea;
