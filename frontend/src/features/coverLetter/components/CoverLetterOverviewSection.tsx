import { emptyCaseText } from '@/features/coverLetter/constants';
import { useCoverLetterSearch } from '@/features/coverLetter/hooks/useCoverLetterQueries';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import EmptyCase from '@/shared/components/EmptyCase';

interface CoverLetterSectionProps {
  searchWord: string;
  isFilterActive: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

const CoverLetterOverviewSection = ({
  searchWord,
  isFilterActive,
  page,
  onPageChange,
}: CoverLetterSectionProps) => {
  // TODO: isFilterActive가 true일 때 첨삭 active 필터링 API로 교체
  const { data } = useCoverLetterSearch(
    isFilterActive ? '' : searchWord,
    9,
    page + 1,
  );
  const coverLetters = data.coverLetters ?? [];
  const overviewEmptyText = emptyCaseText['overview'];

  if (coverLetters.length === 0) {
    return <EmptyCase {...overviewEmptyText} />;
  }

  return (
    <CoverLetterOverview
      coverLetters={coverLetters}
      isCoverLetter
      currentPage={page}
      totalPages={data.page.totalPages}
      onPageChange={onPageChange}
    />
  );
};

export default CoverLetterOverviewSection;
