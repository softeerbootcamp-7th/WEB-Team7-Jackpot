import { Link } from 'react-router';

import CoverLetterPreview from '@/shared/components/CoverLetterPreview';
import Pagination from '@/shared/components/Pagination';
import * as SI from '@/shared/icons';
import type { RecentCoverLetterType } from '@/shared/types/coverLetter';

interface CoverLetterOverviewProps {
  coverLetters: RecentCoverLetterType[];
  isCoverLetter?: boolean;
  isHome?: boolean;
  currentPage?: number;
  totalPage?: number;
  onPageChange?: (page: number) => void;
}

const WritingCoverLetterTitle = ({ isHome }: { isHome: boolean }) => {
  return (
    <div
      className={`inline-flex w-full items-center justify-between self-stretch rounded-lg p-2 ${isHome ? 'cursor-pointer transition-colors duration-200 hover:bg-gray-100' : ''}`}
    >
      <div className='flex items-center justify-start gap-2.5'>
        <div className='h-7 w-7'>
          <SI.WritingCoverLetterIcon />
        </div>
        <div className='text-title-l justify-start font-bold text-gray-950'>
          작성 중인 자기소개서
        </div>
      </div>
      {isHome && <SI.RightArrow />}
    </div>
  );
};

const CoverLetterOverview = ({
  coverLetters,
  isCoverLetter = false,
  isHome = false,
  currentPage = 0,
  totalPage,
  onPageChange,
}: CoverLetterOverviewProps) => {
  return (
    <div className='inline-flex w-full flex-col items-start justify-start gap-6'>
      {isHome ? (
        <Link
          to={'/cover-letter'}
          aria-label='자기소개서 작성 페이지로 이동'
          className='block w-full'
        >
          <WritingCoverLetterTitle isHome={isHome} />
        </Link>
      ) : (
        <WritingCoverLetterTitle isHome={isHome} />
      )}
      <div className='grid w-full grid-cols-3 gap-3'>
        {coverLetters.map((coverLetter) => (
          <CoverLetterPreview
            key={coverLetter.coverLetterId}
            data={coverLetter}
            isCoverLetter={isCoverLetter}
          />
        ))}
      </div>
      {!isHome && totalPage !== undefined && onPageChange && (
        <div className='flex w-full justify-center'>
          <Pagination
            current={currentPage}
            total={totalPage}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CoverLetterOverview;
