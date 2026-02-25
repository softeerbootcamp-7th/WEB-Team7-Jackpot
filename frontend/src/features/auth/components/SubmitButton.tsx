interface SubmitButtonProps {
  isActived: boolean;
  value: string;
}

const SubmitButton = ({ isActived, value }: SubmitButtonProps) => {
  const buttonActiveStyle: string = isActived
    ? 'bg-gray-900 text-white cursor-pointer hover:bg-gray-700 transition-colors duration-200'
    : 'bg-gray-50 text-gray-400';

  return (
    <input
      className={`w-full ${buttonActiveStyle} rounded-lg px-5 py-[0.75rem]`}
      type='submit'
      disabled={!isActived}
      value={value}
    />
  );
};

export default SubmitButton;
