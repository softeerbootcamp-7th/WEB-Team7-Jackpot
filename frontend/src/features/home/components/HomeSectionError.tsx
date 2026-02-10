interface HomeSectionErrorProps {
  onRetry?: () => void;
}

const HomeSectionError = ({ onRetry }: HomeSectionErrorProps) => {
  return (
    <div className='flex flex-col items-center justify-center gap-2 py-12 text-center'>
      <p className='text-sm font-semibold text-gray-700'>
        데이터를 불러오지 못했어요
      </p>
      <p className='text-xs text-gray-400'>
        통계, 일정, 자기소개서 정보를 표시할 수 없습니다
      </p>

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

export default HomeSectionError;
