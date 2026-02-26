import { emptyCaseText } from '@/features/coverLetter/constants';
import { useCoverLetterSearch } from '@/features/coverLetter/hooks/useCoverLetterQueries';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import EmptyCase from '@/shared/components/EmptyCase';

interface CoverLetterSearchResultProps {
  searchWord: string;
  page: number;
  onPageChange: (page: number) => void;
}

const CoverLetterSearchResult = ({
  searchWord,
  page,
  onPageChange,
}: CoverLetterSearchResultProps) => {
  // 파라미터 순서 정확히 매칭 (searchWord, size, page)
  const { data } = useCoverLetterSearch(searchWord, 9, page);

  const overviewEmptyText = emptyCaseText['search'];

  if (!data || data.coverLetters.length === 0) {
    return <EmptyCase {...overviewEmptyText} />;
  }

  return (
    <div className='h-full w-full'>
      <CoverLetterOverview
        coverLetters={data.coverLetters}
        isCoverLetter={true}
        isHome={false}
        currentPage={page - 1} // UI는 0-based
        totalPage={data.page.totalPage}
        onPageChange={(zeroBasedPage) => onPageChange(zeroBasedPage + 1)}
      />
    </div>
  );
};

export default CoverLetterSearchResult;
