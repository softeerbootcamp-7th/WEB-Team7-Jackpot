interface CheckDuplicationButtonProps {
  onClick: () => void;
  isActived: boolean;
}

const CheckDuplicationButton = ({
  onClick,
  isActived,
}: CheckDuplicationButtonProps) => {
  const buttonActiveStyle: string = isActived
    ? 'bg-gray-900 text-white cursor-pointer'
    : 'bg-gray-100 text-gray-400';

  return (
    <button
      type='button'
      disabled={!isActived}
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-bold transition-colors ${
        buttonActiveStyle
      }`}
    >
      중복확인
    </button>
  );
};

export default CheckDuplicationButton;
