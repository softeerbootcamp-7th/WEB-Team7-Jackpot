import StepInformation from '@/features/upload/components/StepInformation';
import { STEP_DATA } from '@/features/upload/constants/uploadPage';
import * as UI from '@/features/upload/icons';

interface StepItemProps {
  step: string;
}

const StepItem = ({ step }: StepItemProps) => {
  const STEP_ICONS: Record<string, React.ReactNode> = {
    '1': <UI.UploadInputIcon />,
    '2': <UI.LabelingResultIcon />,
    '3': <UI.UploadCompleteIcon />,
    '3-error': <UI.UploadCompleteIcon />,
  };
  const generateStepIcon = () => STEP_ICONS[step] ?? null;

  return (
    <div className='flex flex-col items-center justify-center gap-7 select-none'>
      <div className='relative h-[9.375rem] w-[30.25rem]'>
        <div key={step} className='animate-soft-pop absolute inset-0 z-0'>
          {generateStepIcon()}
        </div>
        <div className='absolute inset-0 z-10 flex select-none'>
          {['1', '2', '3'].map((each) => {
            const isErrorStep = each === '3' && step === '3-error';
            const currentKey = isErrorStep ? '3-error' : each;
            const currentStepData = STEP_DATA[currentKey] ?? STEP_DATA['3'];

            const isActive = each === step || isErrorStep;
            const CurrentIconComponent = currentStepData?.Icon;

            return (
              <StepInformation
                key={each}
                className={`${currentStepData.className} transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-300'}`}
                icon={
                  CurrentIconComponent && (
                    <CurrentIconComponent
                      color={isActive ? 'white' : 'var(--color-gray-200)'}
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
      <div
        key={step + '-text'}
        className='animate-soft-pop flex flex-col gap-1 text-center'
      >
        <div className='text-xl font-bold text-gray-600'>
          {STEP_DATA[step]?.loadingTitle ?? STEP_DATA['3'].loadingTitle}
        </div>
        <div className='text-base font-normal text-gray-400'>
          {STEP_DATA[step]?.loadingSubTitle ?? STEP_DATA['3'].loadingSubTitle}
        </div>
      </div>
    </div>
  );
};

export default StepItem;
