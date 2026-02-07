import type { ReactNode } from 'react';

import CoverLetterPreview from '@/shared/components/CoverLetterPreview';
import WritingCoverLetterIcon from '@/shared/icons/WritingCoverLetter';

interface CoverLetterOverviewProps {
  button?: ReactNode;
  len: number;
  isCoverLetter?: boolean;
}

//  w-[82.5rem]
const CoverLetterOverview = ({
  button,
  len,
  isCoverLetter = false,
}: CoverLetterOverviewProps) => {
  const previews = Array.from({ length: len });

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
        {previews.map((_, idx) => (
          <CoverLetterPreview isCoverLetter={isCoverLetter} key={idx} />
        ))}
      </div>
    </div>
  );
};

export default CoverLetterOverview;
