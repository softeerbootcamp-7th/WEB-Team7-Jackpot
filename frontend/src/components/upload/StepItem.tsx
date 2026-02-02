import AILabelingIcon from '@/components/upload/icons/AILabelingIcon';
import CompleteSavedIcon from '@/components/upload/icons/CompleteSavedIcon';
import FirstStepIcon from '@/components/upload/icons/FirstStepIcon';
import UploadIcon from '@/components/upload/icons/UploadIcon';

const StepItem = () => {
  return (
    <div className='flex flex-col justify-center items-center gap-7 select-none'>
      <div className='relative w-[30.25rem] h-[9.375rem]'>
        <div className='absolute inset-0 z-0'>
          <FirstStepIcon />
        </div>
        <div className='absolute inset-0 z-10 flex select-none'>
          <div className='absolute flex flex-col items-center text-white top-1/2 left-[4.6875rem] -translate-x-1/2 -translate-y-1/2'>
            <UploadIcon color='white' />
            <div className='font-bold text-xs mt-1'>step 01</div>
            <div className='font-bold text-base'>자료 업로드</div>
          </div>
          <div className='absolute flex flex-col items-center top-1/2 left-[242px] -translate-x-1/2 -translate-y-1/2 text-gray-300'>
            <AILabelingIcon color='var(--color-gray-200)' />
            <div className='font-bold text-xs mt-1'>step 02</div>
            <div className='font-bold text-base'>AI 라벨링</div>
          </div>
          <div className='absolute flex flex-col items-center top-1/2 left-[408px] -translate-x-1/2 -translate-y-1/2 text-gray-300'>
            <CompleteSavedIcon color='var(--color-gray-200)' />
            <div className='font-bold text-xs mt-1'>step 03</div>
            <div className='font-bold text-base'>저장 완료</div>
          </div>
        </div>
      </div>
      <div className='flex flex-col text-center gap-1'>
        <div className='font-bold text-xl text-gray-600'>
          질문과 답변으로 구성된 자기소개서 파일 혹은 텍스트를 입력해주세요!
        </div>
        <div className='font-normal text-base text-gray-400'>
          AI 라벨링을 거쳐 라이브러리에 저장되며, 언제든 다시 꺼내볼 수 있어요.
        </div>
      </div>
    </div>
  );
};

export default StepItem;
