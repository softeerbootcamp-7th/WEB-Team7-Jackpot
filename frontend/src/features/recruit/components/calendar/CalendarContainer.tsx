// [박소민] TODO: 무한 스크롤 확인하기
import { useEffect, useMemo } from 'react';

import Calendar from '@/features/recruit/components/calendar/Calendar';
import { useInfiniteCalendarDates } from '@/features/recruit/hooks/queries/useCalendarQuery';
import { useCalendar } from '@/features/recruit/hooks/useCalendar';
import { getISODate } from '@/shared/utils/dates';

const CalendarContainer = () => {
  const { currentDate, today, startDate, endDate, days, helpers } =
    useCalendar();

  const startDateStr = useMemo(() => getISODate(startDate), [startDate]);
  const endDateStr = useMemo(() => getISODate(endDate), [endDate]);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteCalendarDates({
      startDate: startDateStr,
      endDate: endDateStr,
      size: 100,
    });

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const eventsByDate = useMemo(() => {
    if (!data) return {};

    const allItems = data.pages.flatMap((page) => page.coverLetters);
    const map: Record<string, typeof allItems> = {};

    allItems.forEach((item) => {
      const dateKey = getISODate(item.deadline);

      if (!dateKey) return;

      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(item);
    });

    return map;
  }, [data]);

  return (
    <Calendar
      isLoading={isLoading}
      currentDate={currentDate}
      today={today}
      days={days}
      helpers={helpers}
      eventsByDate={eventsByDate}
    />
  );
};

export default CalendarContainer;
