import CoverLetterSearchResult from '@/features/coverLetter/components/overview/CoverLetterSearchResult';
import SharedCoverLetterResult from '@/features/coverLetter/components/overview/SharedCoverLetterResult';

interface OverviewSectionProps {
  searchWord: string;
  isFilterActive?: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

const OverviewSection = ({
  searchWord,
  isFilterActive,
  page,
  onPageChange,
}: OverviewSectionProps) => {
  

  // useSuspenseQuery 제약 때문에 컴포넌트를 분리해서 마운트
  if (isFilterActive) {
    return <SharedCoverLetterResult />;
  }

  return (
    <CoverLetterSearchResult
      searchWord={searchWord}
      page={page}
      onPageChange={onPageChange}
    />
  );
};

export default OverviewSection;
