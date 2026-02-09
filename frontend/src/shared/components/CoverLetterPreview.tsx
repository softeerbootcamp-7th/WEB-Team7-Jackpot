import fileIcon from '/images/file.svg';
import { Link } from 'react-router';

import type { RecentCoverLetter } from '@/shared/types/coverLetter';
import { getDate } from '@/shared/utils/dates';

interface CoverLetterPreviewProps {
  data: RecentCoverLetter;
  isCoverLetter?: boolean;
}

const CoverLetterPreview = ({
  data,
  isCoverLetter = false,
}: CoverLetterPreviewProps) => {
  const getApplyHalfText = (applyHalf: string) => {
    return `${data.applyYear}년 ${applyHalf}`;
  };

  return (
    <Link
      to={`/coverLetter/edit/${data.coverLetterId}`}
      className={`${isCoverLetter ? 'h-[11.25rem]' : ''} flex flex-1 cursor-pointer items-center justify-start gap-9 rounded-2xl py-6 pr-6 pl-9 outline outline-1 outline-offset-[-1px] outline-gray-100`}
    >
      <img src={fileIcon} className='h-16 w-14' alt='' aria-hidden='true' />
      <div className='inline-flex flex-1 flex-col items-start justify-start gap-2'>
        <div className='flex max-h-[60px] flex-wrap gap-1 overflow-hidden'>
          <div className='flex items-center justify-center rounded-xl bg-blue-50 px-3 py-1.5'>
            <div className='text-xs leading-4 font-medium text-blue-600'>
              {data.companyName}
            </div>
          </div>
          <div className='flex items-center justify-center rounded-xl bg-gray-50 px-3 py-1.5'>
            <div className='text-xs leading-4 font-medium text-gray-600'>
              {getApplyHalfText(data.applyHalf)}
            </div>
          </div>
        </div>
        <div className='inline-flex items-start justify-end gap-1'>
          <div className='text-title-s line-clamp-1 justify-start self-stretch font-bold text-gray-950'>
            {data.companyName} - {data.jobPosition}
          </div>
        </div>

        {isCoverLetter && (
          <div className='text-caption-l line-clamp-2 h-10 max-h-14 justify-start self-stretch font-normal text-gray-400'>
            {/* TODO: 백엔드 API에서 previewText 제공 시 표시 */}
            {/* 현재는 API 응답에 답변 미리보기가 없어서 임시로 빈 상태 */}
          </div>
        )}
        <div className='flex flex-row items-center justify-between self-stretch'>
          <div className='text-caption-l font-normal text-gray-400'>
            총 {data.questionCount}문항
          </div>
          <div className='text-caption-l font-normal text-gray-400'>
            {getDate(data.deadline)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CoverLetterPreview;
