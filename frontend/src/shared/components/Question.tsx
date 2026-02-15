// [해결 1] 인터페이스를 export 해서 외부에서도 이 타입을 알 수 있게 합니다.
export interface Props {
  displayIndex: number;
  onRemove?: () => void;
  // 초기값(수정 모드 등)을 위해 defaultProps 추가
  defaultContent?: string;
  defaultType?: string;
}

const Question = ({
  displayIndex,
  onRemove,
  defaultContent = '',
  defaultType = '',
}: Props) => {
  const formattedIndex = String(displayIndex).padStart(2, '0');

  return (
    <div className='flex flex-col items-start justify-start gap-3 self-stretch rounded-lg bg-gray-50 px-5 pt-3.5 pb-5'>
      <div className='flex flex-col items-start justify-start gap-1.5 self-stretch'>
        <div className='flex items-center justify-between'>
          <div className='text-caption-m justify-start font-medium text-gray-600'>
            질문 {formattedIndex}
          </div>
          {onRemove && (
            <button
              type='button'
              onClick={onRemove}
              className='z-10 cursor-pointer text-xs text-gray-400 underline'
            >
              삭제
            </button>
          )}
        </div>

        {/* [해결 2] 
            1. select-text: 부모에 select-none이 있어도 입력 가능하게 함
            2. z-10: 다른 요소에 가려지지 않게 함
        */}
        <textarea
          name='questionContents'
          defaultValue={defaultContent}
          className='text-body-s relative z-10 w-full resize-none bg-transparent font-normal text-gray-950 select-text placeholder:text-gray-400 focus:outline-none'
          placeholder='자기소개서 질문을 입력해주세요'
          rows={2}
        />
      </div>

      <input
        type='text'
        name='questionTypes'
        defaultValue={defaultType}
        className='text-caption-m relative z-10 inline-flex h-9 items-center justify-start gap-1 self-stretch overflow-hidden rounded-lg bg-gray-100 py-1 pr-3 pl-4 font-normal text-gray-950 select-text placeholder:text-gray-400 focus:outline-none'
        placeholder='해당 문항의 유형을 입력해주세요 (예: 지원동기)'
      />
    </div>
  );
};

export default Question;
