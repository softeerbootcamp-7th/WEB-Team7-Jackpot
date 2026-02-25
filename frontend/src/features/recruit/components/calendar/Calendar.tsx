import { memo } from 'react';

import CalendarDay from '@/features/recruit/components/calendar/CalendarDay';
import CalendarHeader from '@/features/recruit/components/calendar/CalendarHeader';
import CalendarWeekday from '@/features/recruit/components/calendar/CalendarWeekday';
import CalendarDaySkeleton from '@/features/recruit/components/calendar/skeleton/CalendarDaySkeleton';
import CalendarHeaderSkeleton from '@/features/recruit/components/calendar/skeleton/CalendarHeaderSkeleton';
import type { CalendarCoverLetterItem } from '@/shared/types/coverLetter';
import { getISODate } from '@/shared/utils/dates';

interface Props {
  isLoading: boolean;
  currentDate: Date;
  today: Date;
  days: Date[];
  helpers: {
    isSelected: (date: Date) => boolean;
    isCurrentMonth: (date: Date) => boolean;
  };
  eventsByDate: Record<string, CalendarCoverLetterItem[]>;
}

const Calendar = ({
  isLoading,
  currentDate,
  today,
  days,
  helpers,
  eventsByDate,
}: Props) => {
  return (
    <div className='flex flex-col items-center justify-center gap-6 self-stretch border-r border-gray-100 py-6 pr-8'>
      <div>
        {isLoading ? (
          <CalendarHeaderSkeleton />
        ) : (
          <CalendarHeader day={currentDate} />
        )}
      </div>
      <div className='flex flex-col items-start justify-start gap-3 self-stretch'>
        {/* 캘린더 영역 */}
        <div className='grid grid-cols-7'>
          <CalendarWeekday />

          {isLoading
            ? // 달력 한 달 치 칸 수만큼 반복 최대 6주이므로 이에 따라 스켈레톤 UI 생성 (42개)
              Array.from({ length: 42 }).map((_, index) => (
                <CalendarDaySkeleton key={`skeleton-${index}`} tagCount={2} />
              ))
            : days.map((date) => {
                const dateKey = getISODate(date);

                return (
                  <CalendarDay
                    key={dateKey}
                    today={today}
                    items={eventsByDate[dateKey] || []}
                    date={date}
                    isSelected={helpers.isSelected(date)}
                    isCurrentMonth={helpers.isCurrentMonth(date)}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default memo(Calendar);
