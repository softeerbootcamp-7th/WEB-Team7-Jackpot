import { useNavigate, useParams } from 'react-router';

import DocumentLayout from '@/features/library/components/DocumentLayout';
import { useCompanyListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';
import DocumentItem from '@/shared/components/DocumentItem';
import DocumentList from '@/shared/components/DocumentList';

interface Props {
  className?: string;
}

const CompanyDocumentList = ({ className }: Props) => {
  const { companyName, coverLetterId } = useParams<{
    companyName?: string;
    coverLetterId?: string;
  }>();
  const navigate = useNavigate();

  // 1. 무한 스크롤에 필요한 상태와 함수 추가
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCompanyListQueries(companyName ?? null);

  const coverLetters =
    data?.pages.flatMap((page) =>
      page.coverLetters.map((item) => {
        return {
          coverLetterId: item.id,
          companyName: item.companyName,
          jobPosition: item.jobPosition,
          applySeason: item.applySeason,
          deadline: item.modifiedAt, // 마감일 달라고 하기
          questionCount: item.questionCount,
        };
      }),
    ) ?? [];

  return (
    <DocumentLayout
      title={companyName ?? '제목 없음'}
      backUrl='/library/company'
      className={className}
    >
      <DocumentList
        items={coverLetters}
        isLoading={isLoading}
        isError={isError}
        emptyMessage='등록된 자기소개서가 없습니다.'
        renderItem={(doc) => (
          <DocumentItem
            onClick={(id: number) =>
              navigate(`/library/company/${companyName}/${id}`)
            }
            key={doc.coverLetterId}
            isSelected={
              !coverLetterId || doc.coverLetterId === Number(coverLetterId)
            }
            {...doc}
          />
        )}
        // 2. DocumentList에 무한 스크롤 Props 전달
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
    </DocumentLayout>
  );
};

export default CompanyDocumentList;
