// [박소민] TODO: useSearchParams 사용하여 URL에 선택된 날짜 반영하기
// import { useSearchParams } from 'react-router';

import type { CoverLetterItem } from '@/features/recruit/types';
import { formatDate, isPastDate } from '@/shared/utils/dates';

interface Props {
  date: Date;
  currentDate: Date;
  isSelected: boolean;
  isCurrentMonth: boolean;
  items?: CoverLetterItem[];
  onClick: (date: Date) => void;
}

const CalendarDay = ({
  date,
  currentDate,
  isSelected,
  isCurrentMonth,
  items = [],
  onClick,
}: Props) => {
  // const [days, setDays] = useSearchParams();

  const isPast = isPastDate(date, currentDate);

  const getTextColor = () => {
    if (isSelected) return 'text-blue-600';
    if (isCurrentMonth) return 'text-gray-950';
    return 'text-gray-300';
  };

  return (
    <button
      type='button'
      onClick={() => onClick(date)}
      className={`inline-flex h-32 w-32 flex-col items-start justify-start gap-3.5 rounded-lg p-[5px]`}
    >
      <div className='inline-flex items-center justify-start self-stretch'>
        <div className='flex flex-1 items-center justify-between gap-2.5'>
          <div
            className={`${isSelected ? 'bg-blue-50' : ''} inline-flex h-10 w-10 flex-col items-center justify-center gap-2.5 rounded-md px-2 py-1.5`}
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
              <span className='pl-1 text-xs text-gray-400'>{items.length}</span>
            )}
          </div>
        </div>
      </div>
      {/* 공고 리스트 영역 (최대 2개 표시) */}
      <div className='flex w-full flex-col gap-1 overflow-hidden'>
        {items.slice(0, 2).map((item) => (
          <div
            key={item.coverLetterId}
            className={`${
              isPast ? 'bg-gray-50' : 'bg-blue-50'
            } inline-flex h-7 items-center justify-start gap-1 self-stretch rounded-xl px-3 py-1.5`}
          >
            <div
              className={`${isPast ? 'text-gray-300' : 'text-blue-600'} flex-1 justify-start truncate text-xs leading-4 font-medium opacity-90`}
            >
              {item.companyName}
            </div>
          </div>
        ))}
      </div>
    </button>
  );
};

export default CalendarDay;
