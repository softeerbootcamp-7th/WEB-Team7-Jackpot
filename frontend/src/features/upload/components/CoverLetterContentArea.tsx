import type { QnAType } from '@/features/notification/types/notification';
import Pagination from '@/shared/components/Pagination';

interface CoverLetterContentAreaProps {
  qnAState: number;
  setQnAState: (newValue: number) => void;
  qnAs: QnAType[];
  onChangeQnA: (
    index: number,
    field: 'question' | 'answer',
    value: string,
  ) => void;
  isInitialQuestionFailure: boolean;
  isInitialAnswerFailure: boolean;
}
const CoverLetterContentArea = ({
  qnAState,
  setQnAState,
  qnAs,
  onChangeQnA,
  isInitialQuestionFailure,
  isInitialAnswerFailure,
}: CoverLetterContentAreaProps) => {
  if (!qnAs || qnAs.length === 0) return null;
  const currentQnA = qnAs[qnAState];
  if (!currentQnA) return null;

  return (
    <div className='mb-12 flex flex-5 flex-col gap-6'>
      <div className='flex flex-col gap-4'>
        {/* 문항 (제목) 입력 영역 */}
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-3'>
            <div className='text-body-m flex h-9 w-9 items-center justify-center rounded-md bg-gray-50 font-bold text-gray-600 select-none'>
              {qnAState + 1}
            </div>
            <input
              type='text'
              value={currentQnA.question}
              onChange={(e) =>
                onChangeQnA(qnAState, 'question', e.target.value)
              }
              placeholder='문항을 입력해주세요'
              className={`w-full rounded-lg bg-white px-4 py-1 text-lg font-bold transition-all outline-none placeholder:font-normal hover:bg-gray-50 ${
                isInitialQuestionFailure
                  ? 'border border-red-600'
                  : 'border border-gray-200 text-gray-950'
              }`}
            />
          </div>
          <span
            className={`pl-12 text-sm transition-colors duration-200 ${
              isInitialQuestionFailure
                ? 'text-red-600'
                : 'text-transparent select-none'
            }`}
          >
            자기소개서 내에서 문항을 찾지 못했어요
          </span>
        </div>
        <div className='flex flex-col gap-3 pl-12'>
          <div className='text-sm text-gray-400'>
            {`총 ${currentQnA.answer?.length || 0}자`}
          </div>
          <textarea
            value={currentQnA.answer}
            onChange={(e) => onChangeQnA(qnAState, 'answer', e.target.value)}
            placeholder='답변을 입력해주세요'
            className={`text-body-s fixed-scroll-bar h-96 w-full resize-none overflow-y-auto rounded-lg bg-white px-5 py-4 leading-relaxed whitespace-pre-wrap transition-all outline-none hover:bg-gray-50 ${
              isInitialAnswerFailure
                ? 'border border-red-600'
                : 'border border-gray-200 text-gray-600'
            }`}
          />
          <span
            className={`text-sm transition-colors duration-200 ${
              isInitialAnswerFailure
                ? 'text-red-600'
                : 'text-transparent select-none'
            }`}
          >
            자기소개서 내에서 답변을 찾지 못했어요
          </span>
        </div>
      </div>
      <div className='flex justify-center'>
        <Pagination
          current={qnAState}
          total={qnAs.length}
          onChange={setQnAState}
        />
      </div>
    </div>
  );
};

export default CoverLetterContentArea;
