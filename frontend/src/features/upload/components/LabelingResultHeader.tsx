import * as UI from '@/features/upload/icons';

interface LabelingResultHeaderProps {
  nextStep?: (step: string) => void;
}

const LabelingResultHeader = ({
  nextStep,
}: LabelingResultHeaderProps) => {
  return (
    <div>
      <div className='flex items-center justify-between select-none'>
        <div className='flex gap-[0.625rem]'>
          <UI.AILabelingIcon size='32' />
          <div className='text-2xl font-bold'>
            <span className='text-purple-500'>두 번째</span> 자기소개서는 총
            <span className='text-purple-500'> 3개</span>의 문항으로
            분류되었어요!
          </div>
        </div>
        <button
          type='button'
          onClick={() => nextStep?.('3')}
          className='cursor-pointer rounded-lg bg-gray-900 px-5 py-3 text-lg font-bold text-white'
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default LabelingResultHeader;
