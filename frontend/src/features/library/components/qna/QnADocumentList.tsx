import { useNavigate, useParams } from 'react-router';

import { getMockQuestionsByQnAName } from '@/features/library/api/mockData';
import DocumentList from '@/features/library/components/DocumentList';
import QnADocument from '@/features/library/components/qna/QnADocument';
import { useQnAListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';

type Props = {
  className: string;
};

const isDev = import.meta.env.DEV;

const QnADocumentList = ({ className }: Props) => {
  const { qnAName } = useParams<{ qnAName?: string }>();
  const navigate = useNavigate();

  const { data } = useQnAListQueries(qnAName ?? null);
  const questions =
    data?.pages.flatMap((page) => page.questions) ??
    (isDev ? getMockQuestionsByQnAName(qnAName ?? null) : []);

  return (
    <DocumentList
      className={className}
      // `qnAName`이 없을 경우를 대비해 기본값 설정
      title={qnAName ?? ''}
      items={questions}
      onBack={() => navigate('/library/qna')}
      renderItem={(document) => (
        <QnADocument key={document.id} content={document} />
      )}
    />
  );
};

export default QnADocumentList;
