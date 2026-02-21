import { Link } from 'react-router';

import RightArrow from '@/shared/icons/RightArrow';

interface Props {
  isUrgent: boolean;
  companyName: string;
  position: string;
  coverLetterId: number;
}

const UpcomingScheduleItem = ({
  companyName,
  position,
  coverLetterId,
  isUrgent,
}: Props) => {
  return (
    <Link
      aria-label={isUrgent ? '긴급' : ''}
      to={`/library/company/${encodeURIComponent(companyName)}/${coverLetterId}`}
      className='inline-flex items-center justify-start gap-3.5 self-stretch py-0.5'
    >
      <div
        className={`h-14 w-2 rounded-[3px] ${
          isUrgent ? 'bg-purple-100' : 'bg-gray-100'
        }`}
      />
      <div className='inline-flex h-11 flex-1 flex-col items-start justify-center'>
        <div className='line-clamp-1 justify-start text-base leading-6 font-bold text-gray-700'>
          {companyName}
        </div>
        <div className='text-caption-l line-clamp-1 justify-start self-stretch font-medium text-gray-400'>
          {position}
        </div>
      </div>
      <RightArrow size='sm' aria-hidden='true' />
    </Link>
  );
};

export default UpcomingScheduleItem;
