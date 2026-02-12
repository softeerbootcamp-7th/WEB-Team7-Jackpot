import { NavLink, useParams } from 'react-router';

import { getMockQuestionsByQnAName } from '@/features/library/api/mockData';
import QnADocument from '@/features/library/components/qna/QnADocument';
import { useQnAListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';
import { ChevronLeftIcon } from '@/features/library/icons/ChevronLeft';
import { FolderIcon } from '@/features/library/icons/Folder';

type Props = {
  className: string;
};

const QnADocumentList = ({ className }: Props) => {
  const { qnAName } = useParams<{ qnAName?: string }>();
  const { data } = useQnAListQueries(qnAName ?? null);
  const questions =
    data?.questions ?? getMockQuestionsByQnAName(qnAName ?? null);

  return (
    <div className={`w-full ${className}`}>
      <div className='inline-flex items-center justify-start gap-1 self-stretch px-3'>
        <NavLink to={`/library/qna`}>
          <ChevronLeftIcon />
        </NavLink>
        <div className='flex flex-1 items-center justify-start gap-2'>
          <div className='h-7 w-7'>
            <FolderIcon />
          </div>
          <div className='text-title-m line-clamp-1 flex-1 justify-start font-bold text-gray-950'>
            {qnAName}
          </div>
        </div>
      </div>
      {questions.map((document) => (
        <QnADocument key={document.id} content={document} />
      ))}
    </div>
  );
};

export default QnADocumentList;
