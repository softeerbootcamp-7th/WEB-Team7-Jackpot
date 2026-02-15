import { useMemo } from 'react';

import Calendar from '@/features/recruit/components/calendar/Calendar';
import { useInfiniteCalendarDates } from '@/features/recruit/hooks/queries/useCalendarQuery';
import { useCalendar } from '@/features/recruit/hooks/useCalendar'; 
import { getISODate } from '@/shared/utils/dates';

const CalendarContainer = () => {
  const {
    currentDate,
    today,
    startDate,
    endDate,
    days,
    helpers, 
  } = useCalendar();

  const startDateStr = getISODate(startDate);
  const endDateStr = getISODate(endDate);

  const { data, isLoading } = useInfiniteCalendarDates({
    startDate: startDateStr,
    endDate: endDateStr,
    size: 100,
  });

  const eventsByDate = useMemo(() => {
    if (!data) return {};

    const allItems = data.pages.flatMap((page) => page.coverLetters);
    const map: Record<string, typeof allItems> = {};

    allItems.forEach((item) => {
      const dateKey = item.deadline ? item.deadline.split('T')[0] : '';
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
