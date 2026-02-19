import { useNavigate, useParams } from 'react-router';

import DocumentLayout from '@/features/library/components/DocumentLayout';
import { useCompanyListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';
import DocumentItem from '@/shared/components/DocumentItem';
import DocumentList from '@/shared/components/DocumentList';

interface Props {
  className?: string;
}

const CompanyDocumentList = ({ className }: Props) => {
  const { companyName } = useParams<{ companyName?: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useCompanyListQueries(
    companyName ?? null,
  );

  const coverLetters =
    data?.pages.flatMap((page) =>
      page.coverLetters.map((item) => {
        return {
          coverLetterId: item.id,
          companyName: item.companyName,
          jobPosition: item.jobPosition,
          applySeason: item.applySeason,
          deadline: item.modifiedAt, // [박소민] 마감일 달라고 하기
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
            {...doc}
          />
        )}
      />
    </DocumentLayout>
  );
};

export default CompanyDocumentList;
