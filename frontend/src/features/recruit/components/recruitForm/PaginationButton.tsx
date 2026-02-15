interface Props {
  onClick: () => void;
  step: number;
  isSubmitting: boolean;
  mode: 'CREATE' | 'EDIT';
  isValid?: boolean;
}

const PaginationButton = ({
  onClick,
  step,
  isSubmitting,
  mode,
  isValid,
}: Props) => {
  // 버튼 비활성화 조건: 제출 중/ 폼이 유효하지 않을 때
  const isDisabled = isSubmitting || !isValid;

  return (
    <div className='inline-flex w-full items-center justify-between gap-3'>
      <button
        type='button'
        onClick={onClick}
        disabled={step === 1}
        className='flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-5 py-3 transition-colors hover:bg-gray-100'
      >
        <div className='justify-start text-center text-lg leading-7 font-bold text-gray-600'>
          이전
        </div>
      </button>

      <button
        type='submit'
        disabled={isDisabled}
        className={` ${
          isDisabled
            ? 'cursor-not-allowed bg-gray-50'
            : 'cursor-pointer bg-gray-900 hover:opacity-90'
        } inline-flex flex-1 items-center justify-center gap-1.5 self-stretch rounded-lg px-5 py-3 transition-colors duration-200`}
      >
        <div
          className={` ${
            isDisabled ? 'text-gray-400' : 'text-white'
          } justify-start text-center text-lg leading-7 font-bold`}
        >
          {step === 1
            ? '다음'
            : mode === 'CREATE'
              ? '공고 등록하기'
              : '수정완료'}
        </div>
      </button>
    </div>
  );
};

export default PaginationButton;
