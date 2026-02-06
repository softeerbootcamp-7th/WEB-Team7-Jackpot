import Pagination from '@/shared/components/Pagination';

interface CoverLetterPaginationProps {
  current: number;
  total: number;
  onChange: (index: number) => void;
}

const CoverLetterPagination = (props: CoverLetterPaginationProps) => {
  return <Pagination {...props} ariaLabel='자기소개서' />;
};

export default CoverLetterPagination;
