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
            const currentStepData = STEP_DATA[each];
            const CurrentIconComponent = currentStepData.Icon;
            return (
              <StepInformation
                key={each}
                className={`${currentStepData.className} transition-colors duration-300 ${each === step ? 'text-white' : 'text-gray-300'}`}
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
      <div
        key={step + '-text'}
        className='animate-soft-pop flex flex-col gap-1 text-center'
      >
        <div className='text-xl font-bold text-gray-600'>
          {STEP_DATA[step].loadingTitle}
        </div>
        <div className='text-base font-normal text-gray-400'>
          {STEP_DATA[step].loadingSubTitle}
        </div>
      </div>
    </div>
  );
};

export default StepItem;
