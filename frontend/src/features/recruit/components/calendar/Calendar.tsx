import { useMemo } from 'react';

import CalendarDay from '@/features/recruit/components/calendar/CalendarDay';
import CalendarHeader from '@/features/recruit/components/calendar/CalendarHeader';
import CalendarWeekday from '@/features/recruit/components/calendar/CalendarWeekday';
import CalendarDaySkeleton from '@/features/recruit/components/calendar/skeleton/CalendarDaySkeleton';
import CalendarHeaderSkeleton from '@/features/recruit/components/calendar/skeleton/CalendarHeaderSkeleton';
import { useInfiniteCalendarDates } from '@/features/recruit/hooks/queries/useCalendarQuery';
import { useCalendar } from '@/features/recruit/hooks/useCalendar';
import { getISODate } from '@/shared/utils/dates';

const Calendar = () => {
  const { startDate, endDate, currentDate, days, handlers, helpers } =
    useCalendar();

  const startDateStr = getISODate(startDate);
  const endDateStr = getISODate(endDate);

  const { data, isLoading } = useInfiniteCalendarDates({
    startDate: startDateStr,
    endDate: endDateStr,
    size: 100, // 달력 조회용으로는 한 번에 많이 가져오는 게 유리함
  });

  const eventsByDate = useMemo(() => {
    if (!data) return {};

    const allItems = data.pages.flatMap((page) => page.coverLetters);
    const map: Record<string, typeof allItems> = {};

    allItems.forEach((item) => {
      const dateKey = item.deadline;

      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(item);
    });

    return map;
  }, [data]);

  return (
    <div className='inline-flex flex-col items-center justify-center gap-6 self-stretch py-6'>
      <div className='inline-flex items-center justify-center gap-14 self-stretch'>
        {isLoading ? (
          <CalendarHeaderSkeleton />
        ) : (
          <CalendarHeader
            day={currentDate}
            handlePrevMonth={handlers.handlePrevMonth}
            handleNextMonth={handlers.handleNextMonth}
          />
        )}
      </div>
      <div className='flex flex-col items-start justify-start gap-3 self-stretch'>
        {/* 캘린더 영역 */}
        <div className='grid grid-cols-7'>
          <CalendarWeekday />

          {isLoading
            ? // 달력 한 달 치 칸 수만큼 반복 (35개 | 42개)
              Array.from({ length: 35 }).map((_, index) => (
                <CalendarDaySkeleton key={`skeleton-${index}`} tagCount={2} />
              ))
            : days.map((date) => {
                return (
                  <CalendarDay
                    key={date.toString()}
                    currentDate={currentDate}
                    items={eventsByDate[getISODate(date)] || []}
                    date={date}
                    isSelected={helpers.isSelected(date)}
                    isCurrentMonth={helpers.isCurrentMonth(date)}
                    onClick={handlers.handleDateClick}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
