import { memo } from 'react';

import { Link } from 'react-router';

import { createRecruitPath } from '@/features/recruit/utils';
import * as SI from '@/shared/icons';
import { addMonths, formatYearMonth, subMonths } from '@/shared/utils/dates';

interface Props {
  day: Date;
}

const CalendarHeader = ({ day }: Props) => {
  const prevDate = subMonths(day, 1);
  const nextDate = addMonths(day, 1);

  const prevMonthText = formatYearMonth(prevDate);
  const currentMonthText = formatYearMonth(day);
  const nextMonthText = formatYearMonth(nextDate);

  return (
    <div className='inline-flex items-center justify-center gap-14 self-stretch'>
      <div className='flex items-center justify-start gap-1'>
        <Link
          to={createRecruitPath(prevDate)}
          className='text-title-s justify-start text-center font-medium text-gray-300'
        >
          {prevMonthText}
        </Link>
      </div>

      <div className='flex items-center justify-start gap-5'>
        <Link
          to={createRecruitPath(prevDate)}
          className='flex items-center justify-center'
        >
          <SI.PaginationIcon size={36} direction='left' />
        </Link>

        <div className='flex items-center justify-start gap-1'>
          <div className='text-headline-s justify-start text-center font-bold text-gray-950'>
            {currentMonthText}
          </div>
        </div>

        <Link
          to={createRecruitPath(nextDate)}
          className='flex items-center justify-center'
        >
          <SI.PaginationIcon size={36} direction='right' />
        </Link>
      </div>

      <div className='flex items-center justify-start gap-1'>
        <Link
          to={createRecruitPath(nextDate)}
          className='text-title-s justify-start text-center font-medium text-gray-300'
        >
          {nextMonthText}
        </Link>
      </div>
    </div>
  );
};

export default memo(CalendarHeader);
