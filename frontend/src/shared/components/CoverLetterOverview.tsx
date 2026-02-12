import type { ReactNode } from 'react';

import CoverLetterPreview from '@/shared/components/CoverLetterPreview';
import Pagination from '@/shared/components/Pagination';
import WritingCoverLetterIcon from '@/shared/icons/WritingCoverLetter';
import type { RecentCoverLetter } from '@/shared/types/coverLetter';

interface CoverLetterOverviewProps {
  button?: ReactNode;
  coverLetters: RecentCoverLetter[];
  isCoverLetter?: boolean;
  isHome?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const CoverLetterOverview = ({
  button,
  coverLetters,
  isCoverLetter = false,
  isHome = false,
  currentPage = 0,
  totalPages,
  onPageChange,
}: CoverLetterOverviewProps) => {
  return (
    <div className='inline-flex w-full flex-col items-start justify-start gap-6'>
      <div className='inline-flex items-center justify-between self-stretch'>
        <div className='flex items-center justify-start gap-2.5'>
          <div className='h-7 w-7'>
            <WritingCoverLetterIcon />
          </div>
          <div className='text-title-l justify-start font-bold text-gray-950'>
            작성 중인 자기소개서
          </div>
        </div>
        {button}
      </div>
      <div className='grid w-full grid-cols-3 gap-3'>
        {coverLetters.map((coverLetter) => (
          <CoverLetterPreview
            key={coverLetter.coverLetterId}
            data={coverLetter}
            isCoverLetter={isCoverLetter}
          />
        ))}
      </div>
      {!isHome && totalPages !== undefined && onPageChange && (
        <div className='flex w-full justify-center'>
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CoverLetterOverview;
