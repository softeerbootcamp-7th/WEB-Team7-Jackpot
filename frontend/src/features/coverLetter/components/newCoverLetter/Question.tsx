interface QuestionProps {
  id: number;
}

// 나중에 질문 1이 아니라 질문 01로 처리

const Question = ({ id }: QuestionProps) => {
  return (
    <div
      data-property-1='질문 미등록 & 문항 유형 미등 록'
      className='flex flex-col items-start justify-start gap-3 self-stretch rounded-lg bg-gray-50 px-5 pt-3.5 pb-5'
    >
      <div className='flex flex-col items-start justify-start gap-1.5 self-stretch'>
        <div className='text-caption-m justify-start font-medium text-gray-600'>
          질문 {id}
        </div>
        <div className='text-body-s justify-start self-stretch font-normal text-gray-400'>
          자기소개서 질문을 입력해주세요
        </div>
      </div>
      <input
        className='text-caption-m inline-flex h-9 items-center justify-start gap-1 self-stretch overflow-hidden rounded-lg bg-gray-100 py-1 pr-3 pl-4 font-normal text-gray-400'
        placeholder='해당 문항의 유형을 입력해주세요'
      />
    </div>
  );
};

export default Question;
