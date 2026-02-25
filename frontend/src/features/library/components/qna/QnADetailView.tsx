import { useParams } from 'react-router';

import DetailButtons from '@/features/library/components/DetailButtons';
import DetailView from '@/features/library/components/DetailView';
import { emptyCaseText } from '@/features/library/constants';
import {
  useQnAListQueries,
  useQnAQuery,
} from '@/features/library/hooks/queries/useLibraryListQueries';
import EmptyCase from '@/shared/components/EmptyCase';
import SkeletonCard from '@/shared/components/SkeletonCard';
import { getDate } from '@/shared/utils/dates';

const QnADetailView = () => {
  const { qnAName, qnAId } = useParams<{
    qnAName: string;
    qnAId: string;
  }>();

  // 1. 기존 리스트 쿼리 (기업명, 직무, 지원시기 정보 가져오기용)
  const listQuery = useQnAListQueries(qnAName ?? null);

  // 2. 신규 단건 쿼리 (답변 상세 내용 가져오기용)
  const detailQuery = useQnAQuery(qnAId ? Number(qnAId) : null);

  // 로딩 상태 처리 (둘 중 하나라도 로딩 중이면 로딩 표시)
  if (listQuery.isLoading || detailQuery.isLoading) {
    return <SkeletonCard />;
  }

  // 에러 상태 처리
  if (listQuery.isError || detailQuery.isError) {
    return <EmptyCase {...emptyCaseText.error} />;
  }

  // [기존 로직 유지] 리스트에서 메타데이터(기업명 등) 찾기
  const listDocument = listQuery.data?.pages
    .flatMap((page) => page.qnAs)
    .find((doc) => doc.id === Number(qnAId));

  // 단건 API에서 상세 데이터 가져오기
  const detailDocument = detailQuery.data;

  // 두 데이터 중 하나라도 없으면 문서를 찾을 수 없음 처리
  if (!listDocument || !detailDocument) {
    return <EmptyCase {...emptyCaseText.notFound} />;
  }

  return (
    <DetailView
      companyName={listDocument.companyName}
      jobPosition={listDocument.jobPosition}
      applySeason={listDocument.applySeason ?? ''}
      modifiedAt={getDate(detailDocument.modifiedAt)}
      question={detailDocument.question}
      answer={detailDocument.answer}
      answerSize={detailDocument.answerSize}
      button={
        <DetailButtons
          coverLetterId={listDocument.coverLetterId}
          qnAId={qnAId ? Number(qnAId) : 0}
          initialScrapState={detailDocument.isScraped ?? false}
        />
      }
    />
  );
};

export default QnADetailView;
