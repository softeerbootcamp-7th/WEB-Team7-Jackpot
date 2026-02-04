import { UploadPageIcons } from '@/components/upload/icons';
import StepInformation from '@/components/upload/StepInformation';

import type { StepInformationProps } from '@/types/upload';

interface StepItemProps {
  step: string;
}

const StepData: Record<string, StepInformationProps> = {
  '1': {
    className: 'left-[4.6875rem]',
    Icon: UploadPageIcons.UploadIcon,
    step: 'step 01',
    name: '자료 업로드',
    loadingTitle:
      '질문과 답변으로 구성된 자기소개서 파일 혹은 텍스트를 입력해주세요!',
    loadingSubTitle:
      'AI 라벨링을 거쳐 라이브러리에 저장되며, 언제든 다시 꺼내볼 수 있어요.',
  },
  '2': {
    className: 'left-[242px]',
    Icon: UploadPageIcons.AILabelingIcon,
    step: 'step 02',
    name: 'AI 라벨링',
    loadingTitle: '업로드해주신 자료를 분석하는 중이에요...',
    loadingSubTitle:
      '잠시만 기다려주세요.\nAI가 분석을 마치면 알림을 전송해드릴게요!',
  },
  '3': {
    className: 'left-[408px]',
    Icon: UploadPageIcons.CompleteSavedIcon,
    step: 'step 03',
    name: '저장 완료',
    loadingTitle: '저장이 완료되었어요!',
    loadingSubTitle: '총 3개의 문항이 라이브러리에 저장되었어요.',
  },
};

const StepItem = ({ step }: StepItemProps) => {
  const generateStepIcon = () => {
    if (step === '1') return <UploadPageIcons.FirstStepIcon />;
    else if (step === '2') return <UploadPageIcons.SecondStepIcon />;
  };

  return (
    <div className='flex flex-col justify-center items-center gap-7 select-none'>
      <div className='relative w-[30.25rem] h-[9.375rem]'>
        <div className='absolute inset-0 z-0'>{generateStepIcon()}</div>
        <div className='absolute inset-0 z-10 flex select-none'>
          {['1', '2', '3'].map((each) => {
            const currentStepData = StepData[each];
            const CurrentIconComponent = currentStepData.Icon;
            return (
              <StepInformation
                key={each}
                className={`${currentStepData.className} ${each === step ? 'text-white' : 'text-gray-300'}`}
                icon={
                  CurrentIconComponent && (
                    <CurrentIconComponent
                      color={each === step ? 'white' : 'var(--color-gray-200)'}
                    />
                  )
                }
                step={currentStepData.step}
                name={currentStepData.name}
              />
            );
          })}
        </div>
      </div>
      <div className='flex flex-col text-center gap-1'>
        <div className='font-bold text-xl text-gray-600'>
          {StepData[step].loadingTitle}
        </div>
        <div className='font-normal text-base text-gray-400'>
          {StepData[step].loadingSubTitle}
        </div>
      </div>
    </div>
  );
};

export default StepItem;
