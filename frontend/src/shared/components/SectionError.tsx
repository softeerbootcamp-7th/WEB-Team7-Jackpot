interface SectionErrorProps {
  onRetry?: () => void;
  text: string;
}

const SectionError = ({ onRetry, text }: SectionErrorProps) => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-2 py-12 text-center'>
      <p className='text-sm font-semibold text-gray-700'>
        데이터를 불러오지 못했어요
      </p>
      <p className='text-xs text-gray-400'>{text}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className='mt-2 text-xs font-semibold text-blue-600 hover:underline'
        >
          다시 시도
        </button>
      )}
    </div>
  );
};

export default SectionError;
