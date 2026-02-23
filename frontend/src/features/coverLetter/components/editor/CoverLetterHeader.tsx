import { useMemo } from 'react';

import type { CoverLetterType } from '@/shared/types/coverLetter';
import { getDate } from '@/shared/utils/dates';
import { mapApplyHalf } from '@/shared/utils/recruitSeason';

interface CoverLetterHeaderProps {
  coverLetter: CoverLetterType;
  totalPages: number;
  modifiedAt?: string;
  isSaving?: boolean;
  textUpdatedAt?: string;
}

const CoverLetterHeader = ({
  coverLetter,
  totalPages,
  modifiedAt,
  isSaving = false,
  textUpdatedAt,
}: CoverLetterHeaderProps) => {
  const modifiedDisplay = useMemo(() => {
    const sourceRaw = textUpdatedAt ?? modifiedAt;
    const source = sourceRaw
      ? new Date(sourceRaw)
      : isSaving
        ? new Date()
        : null;
    if (!source || Number.isNaN(source.getTime())) return null;

    return source.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, [isSaving, modifiedAt, textUpdatedAt]);

  return (
    <div className='flex flex-shrink-0 flex-col gap-0.5 pb-2 pl-2'>
      <div className='line-clamp-1 text-xl leading-9 font-bold'>
        {coverLetter.applyYear}년 {mapApplyHalf(coverLetter.applyHalf)}
      </div>
      <div className='flex gap-1 text-sm text-gray-400'>
        <span>총 {totalPages}문항</span>
        <span>·</span>
        <span>
          {coverLetter.deadline ? getDate(coverLetter.deadline) : '마감일 미정'}
        </span>
        {modifiedDisplay && (
          <>
            <span>·</span>
            <span>최종수정 {modifiedDisplay}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default CoverLetterHeader;
