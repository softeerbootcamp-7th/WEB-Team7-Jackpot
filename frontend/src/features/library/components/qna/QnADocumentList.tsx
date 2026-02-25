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

  // 1. 무한 스크롤에 필요한 상태와 함수를 추가로 구조 분해 할당합니다.
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQnAListQueries(qnAName ?? null);

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
        isLoading={isLoading}
        isError={isError}
        emptyMessage='등록된 문항이 없습니다.'
        renderItem={(qna) => <QnADocument key={qna.id} content={qna} />}
        // 2. DocumentList가 Sentinel을 렌더링하고 감지할 수 있도록 Props 전달
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
    </DocumentLayout>
  );
};

export default QnADocumentList;
