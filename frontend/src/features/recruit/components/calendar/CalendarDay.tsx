// [박소민] TODO: NavLink로 변경하는 것 알아보기
import { memo } from 'react';

import { Link } from 'react-router';

import type { CoverLetterItem } from '@/features/recruit/types';
import { formatDate, isPastDate } from '@/shared/utils/dates';

interface Props {
  date: Date;
  today: Date;
  isSelected: boolean;
  isCurrentMonth: boolean;
  items?: CoverLetterItem[];
}

const CalendarDay = ({
  date,
  today,
  isSelected,
  isCurrentMonth,
  items = [],
}: Props) => {
  const isPast = isPastDate(date, today);

  const getTextColor = () => {
    if (isSelected) return 'text-blue-600';
    if (isCurrentMonth) return 'text-gray-950';
    return 'text-gray-300';
  };

  // 날짜 포맷팅 (YYYY/MM/DD)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const targetPath = `/recruit/${year}/${month}/${day}`;

  return (
    <Link
      to={targetPath}
      className={`inline-flex h-28 w-28 cursor-pointer flex-col items-start justify-start gap-2 rounded-lg p-1 transition-colors hover:bg-gray-50`}
    >
      <div className='inline-flex items-center justify-start self-stretch'>
        <div className='flex flex-1 items-center justify-between gap-2'>
          <div
            className={`${isSelected ? 'bg-blue-50' : ''} inline-flex h-8 w-8 flex-col items-center justify-center gap-2 rounded-md px-1.5 py-1`}
          >
            <div
              className={`${getTextColor()} text-title-s h-7 w-6 justify-start text-center font-bold`}
            >
              {formatDate(date)}
            </div>
          </div>
          {/* 공고 개수 표시 */}
          <div className='flex items-center justify-end gap-1'>
            {items.length > 0 && (
              <div className='inline-flex min-w-6 items-center justify-center gap-1 rounded-[10px] bg-gray-50 px-2 py-1'>
                <span className='text-center text-xs leading-4 font-medium text-gray-400'>
                  {items.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 공고 리스트 영역 */}
      <div className='flex w-full flex-col gap-1 overflow-hidden'>
        {items.slice(0, 2).map((item) => (
          <div
            key={item.coverLetterId}
            className={`${
              isPast ? 'bg-gray-50' : 'bg-blue-50'
            } inline-flex h-6 items-center justify-start gap-1 self-stretch rounded-xl px-2 py-1`}
          >
            <div
              className={`${isPast ? 'text-gray-300' : 'text-blue-600'} flex-1 justify-start truncate text-xs leading-4 font-medium opacity-90`}
            >
              {item.companyName}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
};

export default memo(CalendarDay);
