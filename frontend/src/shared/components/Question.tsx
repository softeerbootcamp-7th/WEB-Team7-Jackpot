import SearchableSelectInput from '@/shared/components/SearchableSelectInput';
import { CATEGORY_VALUES } from '@/shared/constants/createCoverLetter';
import * as SI from '@/shared/icons/index';
import type { CoverLetterQuestion } from '@/shared/types/coverLetter';

interface Props {
  displayIndex: number;
  data: CoverLetterQuestion;
  onChange: (key: keyof CoverLetterQuestion, value: string) => void;
  onRemove?: () => void;
}

const Question = ({ displayIndex, data, onChange, onRemove }: Props) => {
  const formattedIndex = String(displayIndex).padStart(2, '0');

  return (
    <div className='group relative flex w-full flex-col items-start justify-start gap-3 rounded-lg bg-gray-50 px-5 pt-3.5 pb-5 transition-colors hover:bg-gray-100'>
      {onRemove && (
        <button
          type='button'
          onClick={onRemove}
          className='absolute top-3 right-3 h-3 w-3 cursor-pointer text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100'
        >
          <SI.DeleteIcon />
        </button>
      )}

      <div className='flex w-full flex-col items-start justify-start gap-1.5'>
        <div className='text-caption-m w-full justify-start font-medium text-gray-600'>
          질문 {formattedIndex}
        </div>

        {/* 1. 질문 내용 */}
        <textarea
          value={data.question}
          aria-label={`질문 ${formattedIndex} 내용`}
          onChange={(e) => onChange('question', e.target.value)}
          className='text-body-s resize-none justify-start border-b border-gray-300 self-stretch bg-transparent font-normal text-gray-950 outline-none placeholder:text-gray-400'
          placeholder='자기소개서 질문을 입력해주세요'
          rows={1}
        />
      </div>

      {/* 2. 카테고리 */}
      <SearchableSelectInput
        value={data.category}
        aria-label={`질문 ${formattedIndex} 카테고리`}
        options={CATEGORY_VALUES}
        onChange={(value) => onChange('category', value)}
        placeholder='해당 문항의 유형을 입력해주세요 (예: 지원동기, 성장과정)'
      />
    </div>
  );
};

export default Question;
