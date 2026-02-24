import { useParams } from 'react-router';

import DocumentLayout from '@/features/library/components/DocumentLayout';
import QnADocument from '@/features/library/components/qna/QnADocument';
import { useQnAListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';
import DocumentList from '@/shared/components/DocumentList';

interface Props {
  className?: string;
}

const QnADocumentList = ({ className }: Props) => {
  const { qnAName } = useParams<{ qnAName?: string }>();

  // isLoading, isError도 함께 구조분해 할당 추천
  const { data } = useQnAListQueries(qnAName ?? null);
  const questions =
    data?.pages.flatMap((page) =>
      page.qnAs.map((item) => {
        return {
          id: item.id,
          companyName: item.companyName,
          jobPosition: item.jobPosition,
          applySeason: item.applySeason,
          question: item.question,
          answer: item.answer,
          coverLetterId: item.coverLetterId,
        };
      }),
    ) ?? [];

  return (
    <DocumentLayout
      title={qnAName ?? '제목 없음'}
      backUrl='/library/qna'
      className={className}
    >
      <DocumentList
        items={questions}
        renderItem={(qna) => <QnADocument key={qna.id} content={qna} />}
      />
    </DocumentLayout>
  );
};

export default QnADocumentList;
