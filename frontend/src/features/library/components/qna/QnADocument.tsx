import { NavLink, useParams } from 'react-router';

import type { QuestionItem } from '@/features/library/types';

interface DocumentProps {
  content: QuestionItem;
}

const QnADocument = ({ content }: DocumentProps) => {
  const { qnAName, qnAId } = useParams<{ qnAName?: string; qnAId?: string }>();
  const { id, companyName, jobPosition, applySeason, question, answer } =
    content;

  const isSelected = !qnAId || Number(qnAId) === id;

  return (
    <NavLink
      className={`w-full ${isSelected ? '' : 'opacity-30'}`}
      to={`/library/qna/${qnAName}/${id}`}
    >
      <div className='inline-flex w-96 flex-col items-start justify-start gap-3 border-b border-gray-100 px-3 py-5'>
        <div className='inline-flex items-center justify-between self-stretch'>
          <div className='flex flex-1 items-center justify-start gap-1'>
            <div className='flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
              <div className='gray-600 justify-start text-xs leading-4 font-medium text-blue-600'>
                {companyName}
              </div>
            </div>
            <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
              <div className='gray-600 justify-start text-xs leading-4 font-medium text-gray-600'>
                {jobPosition}
              </div>
            </div>
            <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
              <div className='gray-600 justify-start text-xs leading-4 font-medium text-gray-600'>
                {applySeason}
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-start justify-start gap-1 self-stretch'>
          <div className='inline-flex items-center justify-start gap-1 self-stretch'>
            <div className='gray-600 line-clamp-2 max-h-12 flex-1 justify-start text-lg leading-6 font-bold text-gray-950'>
              {question}
            </div>
          </div>
          <div className='gray-600 text-caption-l line-clamp-2 max-h-10 justify-start self-stretch font-medium text-gray-600'>
            {answer}
          </div>
        </div>
      </div>
    </NavLink>
  );
};

export default QnADocument;
