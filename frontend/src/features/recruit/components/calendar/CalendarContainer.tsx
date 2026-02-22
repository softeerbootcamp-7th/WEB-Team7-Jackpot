import { useMemo } from 'react';

import Calendar from '@/features/recruit/components/calendar/Calendar';
import { useInfiniteCalendarDates } from '@/features/recruit/hooks/queries/useCalendarQuery';
import { useCalendar } from '@/features/recruit/hooks/useCalendar';
import { getISODate } from '@/shared/utils/dates';

const CalendarContainer = () => {
  const { currentDate, today, startDate, endDate, days, helpers } =
    useCalendar();

  const startDateStr = useMemo(() => getISODate(startDate), [startDate]);
  const endDateStr = useMemo(() => getISODate(endDate), [endDate]);

  // 💡 수정됨: isLoading 외의 불필요한 무한 스크롤 관련 상태(hasNextPage 등) 제거
  const { data, isLoading } = useInfiniteCalendarDates({
    startDate: startDateStr,
    endDate: endDateStr,
    size: 100, // 한 달 치 데이터로는 충분히 넉넉한 사이즈
    isShared: false,
  });

  const eventsByDate = useMemo(() => {
    if (!data) return {};

    // 첫 페이지만 그리기
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
