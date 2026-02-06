import type { StepInformationProps } from '@/features/upload/types/upload';

const StepInformation = ({
  className,
  icon,
  step,
  name,
}: StepInformationProps) => {
  return (
    <div
      className={`absolute flex flex-col items-center top-1/2 ${className} -translate-x-1/2 -translate-y-1/2`}
    >
      {icon}
      <div className='font-bold text-xs mt-1'>{step}</div>
      <div className='font-bold text-base'>{name}</div>
    </div>
  );
};

export default StepInformation;
