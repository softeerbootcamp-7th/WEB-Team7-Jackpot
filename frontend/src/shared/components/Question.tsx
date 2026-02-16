import type { CoverLetterQuestion } from '@/shared/types/coverLetter';

interface QuestionProps {
  displayIndex: number;
  data: CoverLetterQuestion;
  onChange: (key: keyof CoverLetterQuestion, value: string) => void;
  onRemove?: () => void;
}

const Question = ({
  displayIndex,
  data,
  onChange,
  onRemove,
}: QuestionProps) => {
  const formattedIndex = String(displayIndex).padStart(2, '0');

  return (
    <div className='group relative flex flex-col items-start justify-start gap-3 self-stretch rounded-lg bg-gray-50 px-5 pt-3.5 pb-5 transition-colors hover:bg-gray-100'>
      {onRemove && (
        <button
          type='button'
          onClick={onRemove}
          className='absolute top-3 right-3 text-xs font-medium text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500'
        >
          삭제
        </button>
      )}

      <div className='flex flex-col items-start justify-start gap-1.5 self-stretch'>
        <div className='text-caption-m justify-start font-medium text-gray-600'>
          질문 {formattedIndex}
        </div>

        {/* 1. 질문 내용 */}
        <textarea
          value={data.question}
          aria-label={`질문 ${formattedIndex} 내용`}
          onChange={(e) => onChange('question', e.target.value)}
          className='text-body-s resize-none justify-start self-stretch bg-transparent font-normal text-gray-950 outline-none placeholder:text-gray-400'
          placeholder='자기소개서 질문을 입력해주세요'
          rows={2}
        />
      </div>

      {/* 2. 카테고리 */}
      <input
        type='text'
        value={data.category}
        aria-label={`질문 ${formattedIndex} 카테고리`}
        onChange={(e) => onChange('category', e.target.value)}
        className='text-caption-m inline-flex h-9 w-full items-center justify-start rounded-lg bg-white px-4 font-normal text-gray-950 ring-1 ring-gray-200 outline-none placeholder:text-gray-400 focus:ring-blue-500'
        placeholder='해당 문항의 유형을 입력해주세요 (예: 지원동기, 성장과정)'
      />
    </div>
  );
};

export default Question;
