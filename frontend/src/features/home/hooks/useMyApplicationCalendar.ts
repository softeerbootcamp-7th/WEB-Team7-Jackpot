import { useDataGrid } from '@/shared/hooks/useDataGrid';
import { getThreeWeekRange, isPastDay } from '@/shared/utils/dates';

export const useMyApplicationCalendar = () => {
  const today = new Date();

  const { startDate, endDate } = getThreeWeekRange(today);

  const days = useDataGrid(startDate, endDate);

  return {
    days,
    isPastDay: (date: Date) => isPastDay(today, date),
    hasApplication: () => false, // [박소민] TODO: 캘린더 로직 추가 후 수정
  };
};
