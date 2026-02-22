import type { QnAType } from '@/features/notification/types/notification';
import Pagination from '@/shared/components/Pagination';

interface CoverLetterContentAreaProps {
  qnAState: number;
  setQnAState: (newValue: number) => void;
  qnAs: QnAType[];
}
const CoverLetterContentArea = ({
  qnAState,
  setQnAState,
  qnAs,
}: CoverLetterContentAreaProps) => {
  if (!qnAs || qnAs.length === 0) return null;
  const currentQnA = qnAs[qnAState];
  if (!currentQnA) return null;

  return (
    <div className='mb-12 flex flex-5 flex-col gap-6'>
      <div>
        <div className='flex items-center gap-3'>
          <div className='text-body-m flex h-9 w-9 items-center justify-center rounded-md bg-gray-50 font-bold text-gray-600 select-none'>
            {qnAState + 1}
          </div>
          <div className='text-lg font-bold text-gray-950 select-text'>
            {currentQnA.question}
          </div>
        </div>
        <div className='flex flex-col gap-3 pl-13'>
          <div className='text-sm text-gray-400'>
            {`총 ${currentQnA.answerSize}자`}
          </div>
          <div className='text-body-s fixed-scroll-bar h-96 overflow-y-auto whitespace-pre-wrap text-gray-600 select-text'>
            {currentQnA.answer.split('\n').map((paragraph, index) => (
              <p key={index} className='mb-2 min-h-[1rem] leading-relaxed'>
                {paragraph}
              </p>
            ))}
          </div>
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
