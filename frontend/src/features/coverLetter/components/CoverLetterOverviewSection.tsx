import { useCoverLetterSearch } from '@/features/coverLetter/hooks/useCoverLetterQueries';
import { emptyCaseText } from '@/features/library/constants';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import EmptyCase from '@/shared/components/EmptyCase';

interface CoverLetterSectionProps {
  searchWord: string;
  page: number;
  onPageChange: (page: number) => void;
}

const CoverLetterOverviewSection = ({
  searchWord,
  page,
  onPageChange,
}: CoverLetterSectionProps) => {
  const { data } = useCoverLetterSearch(searchWord, 9, page + 1);
  const coverLetters = data?.coverLetters ?? [];
  const coverLetterEmptyCaseText = emptyCaseText['overview'];

  if (coverLetters.length === 0) {
    return <EmptyCase {...coverLetterEmptyCaseText} />;
  }

  return (
    <CoverLetterOverview
      coverLetters={coverLetters}
      isCoverLetter
      currentPage={page}
      totalPages={data?.page.totalPages}
      onPageChange={onPageChange}
    />
  );
};

export default CoverLetterOverviewSection;
