interface StepInformationProps {
  className: string;
  icon: React.ReactNode;
  step: string;
  name: string;
}

const StepInformation = ({
  className,
  icon,
  step,
  name,
}: StepInformationProps) => {
  return (
    <div
      className={`absolute top-1/2 flex flex-col items-center ${className} -translate-x-1/2 -translate-y-1/2`}
    >
      {icon}
      <div className='mt-1 text-xs font-bold'>{step}</div>
      <div className='text-base font-bold'>{name}</div>
    </div>
  );
};

export default StepInformation;
