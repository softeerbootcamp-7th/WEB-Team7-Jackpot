interface SubmitButtonProps {
  isActived: boolean;
  value: string;
}

const SubmitButton = ({isActived, value}: SubmitButtonProps) => {
    const buttonActiveStyle: string = isActived
    ? 'bg-gray-900 text-white cursor-pointer'
    : 'bg-gray-50 text-gray-400';

  return (
    <input
      className={`w-full ${buttonActiveStyle} px-5 py-[0.75rem] rounded-lg`}
      type='submit'
      disabled={!isActived}
      value={value}
    />
  );
};

export default SubmitButton;
