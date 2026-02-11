import type { ReactNode } from 'react';

import EmptyState from '@/features/home/components/EmptyState';
import { useRecentCoverLetters } from '@/features/home/hooks/useHomeQueries';
import CoverLetterPreview from '@/shared/components/CoverLetterPreview';
import WritingCoverLetterIcon from '@/shared/icons/WritingCoverLetter';

interface CoverLetterOverviewProps {
  button?: ReactNode;
  len: number;
  isCoverLetter?: boolean;
  showEmptyState?: boolean;
}

const CoverLetterOverview = ({
  button,
  len,
  isCoverLetter = false,
  showEmptyState = false,
}: CoverLetterOverviewProps) => {
  const { data } = useRecentCoverLetters(len);

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
      {data.coverLetters.length > 0 ? (
        <div className='grid w-full grid-cols-3 gap-3'>
          {data.coverLetters.map((coverLetter) => (
            <CoverLetterPreview
              key={coverLetter.coverLetterId}
              data={coverLetter}
              isCoverLetter={isCoverLetter}
            />
          ))}
        </div>
      ) : showEmptyState ? (
        <EmptyState
          title='새로운 자기소개서 작성하기'
          description='아직 작성된 자기소개서가 없어요.<br/>여기를 눌러 새로운 자기소개서를 작성해보세요!'
          to='/cover-letter/list'
          replace
        />
      ) : null}
    </div>
  );
};

export default CoverLetterOverview;
