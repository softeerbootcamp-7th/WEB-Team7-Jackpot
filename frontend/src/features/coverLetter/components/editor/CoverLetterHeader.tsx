import type { CoverLetter } from '@/shared/types/coverLetter';
import { mapApplyHalf } from '@/shared/utils/recruitSeason';

interface CoverLetterHeaderProps {
  coverLetter: CoverLetter;
  totalPages: number;
  modifiedAt?: string;
}

const CoverLetterHeader = ({
  coverLetter,
  totalPages,
  modifiedAt,
}: CoverLetterHeaderProps) => {
  return (
    <div className='flex flex-shrink-0 flex-col gap-0.5 pb-2 pl-2'>
      <div className='line-clamp-1 text-xl leading-9 font-bold'>
        {coverLetter.applyYear}년 {mapApplyHalf(coverLetter.applyHalf)}
      </div>
      <div className='flex gap-1 text-sm text-gray-400'>
        <span>총 {totalPages}문항</span>
        <span>·</span>
        <span>
          {new Date(coverLetter.deadline).toLocaleDateString('ko-KR')}
        </span>
        {modifiedAt && (
          <>
            <span>·</span>
            <span>
              최종수정 {new Date(modifiedAt).toLocaleDateString('ko-KR')}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default CoverLetterHeader;
