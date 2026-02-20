import { useParams, useSearchParams } from 'react-router';

import DetailButtons from '@/features/library/components/DetailButtons';
import DetailView from '@/features/library/components/DetailView';
import {
  useCompanyListQueries,
  useQnAQuery,
} from '@/features/library/hooks/queries/useLibraryListQueries';
import type { CoverLetterItem } from '@/features/library/types';
import Pagination from '@/shared/components/Pagination';
import { useQnAIdListQuery } from '@/shared/hooks/useQnAQueries';
import { getDate } from '@/shared/utils/dates';

// [박소민] 기업 자기소개서 API 최적화하기 (지금은 자기소개서 리스트 + 문항 ID 단건 조회 사용)
const CompanyDetailView = () => {
  const { companyName, coverLetterId } = useParams<{
    companyName: string;
    coverLetterId: string;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();

  // 1. 메타데이터 조회 (기업명, 직무, 지원시기 등)
  const companyQuery = useCompanyListQueries(companyName ?? null);

  // 2. 문항 ID 리스트 조회 (총 문항 수 및 ID 매핑용)
  const qnaIdListQuery = useQnAIdListQuery(
    coverLetterId ? Number(coverLetterId) : null,
  );

  // URL 쿼리 파라미터에서 페이지 읽기 (기본값: 1)
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentQuestionIndex = currentPage - 1; // 0-based index

  // 리스트 쿼리에서 문서 정보 찾기 (헤더 표시용)
  const currentDocument: CoverLetterItem | undefined = companyQuery.data?.pages
    .flatMap((page) => page.coverLetters)
    .find((doc) => doc.id === Number(coverLetterId));

  // ID 리스트에서 현재 페이지에 해당하는 문항 ID 추출
  const qnaIds = qnaIdListQuery.data ?? [];
  const targetQnAId = qnaIds[currentQuestionIndex];

  // 3. 현재 문항 단건 조회 (본문 내용용)
  // targetQnAId가 있을 때만 실행됨
  const qnaDetailQuery = useQnAQuery(targetQnAId ?? null);
  const currentQnA = qnaDetailQuery.data;

  // 로딩 상태 처리 (필수 데이터가 로딩 중일 때)
  if (companyQuery.isLoading || qnaIdListQuery.isLoading) {
    return <div className='p-8'>Loading...</div>;
  }

  // 문서 메타데이터가 없을 때
  if (!currentDocument) {
    return <div className='p-8'>문서를 찾을 수 없습니다.</div>;
  }

  // 문항 데이터 로딩 중이거나 없을 때 처리
  // (ID 리스트는 왔는데 상세 내용이 아직 안 온 경우 포함)
  if (qnaDetailQuery.isLoading) {
    return <div className='p-8'>문항 내용을 불러오는 중...</div>;
  }

  // ID 리스트 범위 밖이거나 데이터가 없을 때
  if (!currentQnA) {
    return <div className='p-8'>해당 페이지의 문항을 찾을 수 없습니다.</div>;
  }

  // 수정일: 단건 조회 데이터 우선, 없으면 문서 전체 수정일
  const modifiedAt = getDate(
    currentQnA.modifiedAt ?? currentDocument.modifiedAt,
  );

  // 페이지 변경 핸들러
  const handlePageChange = (newIndex: number) => {
    // Pagination이 0-based index를 준다면 +1 해서 page 파라미터로 설정
    setSearchParams({ page: String(newIndex + 1) });
  };

  return (
    <DetailView
      companyName={currentDocument.companyName}
      jobPosition={currentDocument.jobPosition}
      applySeason={currentDocument.applySeason ?? ''} // [박소민] TODO: 지원시기 정보가 없을 때 어떻게 할지 처리
      modifiedAt={modifiedAt}
      question={currentQnA.question}
      answer={currentQnA.answer}
      answerSize={currentQnA.answerSize}
      button={
        <DetailButtons
          coverLetterId={currentDocument.id}
          qnAId={targetQnAId ?? 0}
          initialScrapState={currentQnA.isScraped ?? false}
        />
      }
      currentQuestionIndex={currentQuestionIndex}
      qnaIds={qnaIds}
      pagination={
        <Pagination
          current={currentQuestionIndex}
          total={qnaIds.length} // 전체 ID 개수 전달
          onChange={handlePageChange}
          align='end'
        />
      }
    />
  );
};
export default CompanyDetailView;
