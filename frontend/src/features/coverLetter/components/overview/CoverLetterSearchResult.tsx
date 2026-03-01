import { emptyCaseText } from '@/features/coverLetter/constants';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import EmptyCase from '@/shared/components/EmptyCase';
import { useCoverLetterSearch } from '@/shared/hooks/useCoverLetterQueries';

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
