import Pagination from '@/shared/components/Pagination';

interface CoverLetterFooterProps {
  charCount: number;
  currentPageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
}

const CoverLetterFooter = ({
  charCount,
  currentPageIndex,
  totalPages,
  onPageChange,
}: CoverLetterFooterProps) => {
  return (
    <div className='flex h-8 flex-shrink-0 items-center justify-between gap-5 py-0.5'>
      <div className='flex gap-0.5 pl-12 text-base text-gray-400'>
        <span>{charCount.toLocaleString()}</span>
        <span>자</span>
      </div>

      <Pagination
        current={currentPageIndex}
        total={totalPages}
        onChange={onPageChange}
        ariaLabel='문항'
        align='end'
      />
    </div>
  );
};

export default CoverLetterFooter;
