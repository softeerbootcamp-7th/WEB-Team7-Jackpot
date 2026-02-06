import { UploadPageIcons as I } from '@/features/upload/icons';

const SecondContentAreaHeader = () => {
  return (
    <div>
      <div className='flex justify-between items-center select-none'>
        <div className='flex gap-[0.625rem]'>
          <I.AILabelingIcon size='32' />
          <div className='font-bold text-2xl'>
            <span className='text-purple-500'>두 번째</span> 자기소개서는 총
            <span className='text-purple-500'> 3개</span>의 문항으로
            분류되었어요!
          </div>
        </div>
        <button className='px-5 py-3 rounded-lg bg-gray-900 text-white font-bold text-lg cursor-pointer'>
          저장하기
        </button>
      </div>
    </div>
  );
};

export default SecondContentAreaHeader;
