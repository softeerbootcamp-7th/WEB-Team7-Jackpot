import { useCallback, useMemo } from 'react';

import { useNavigate, useParams } from 'react-router';

import { createRecruitPath } from '@/features/recruit/utils';
import { useDataGrid } from '@/shared/hooks/useDataGrid';
import {
  addMonths,
  getMonthRange,
  isSameDay,
  subMonths,
} from '@/shared/utils/dates';

export const useCalendar = () => {
  const navigate = useNavigate();
  const { year, month, day } = useParams();

  const today = useMemo(() => new Date(), []);

  const parseNumberParam = (value?: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const yearNum = parseNumberParam(year) ?? today.getFullYear();
  const monthNum = parseNumberParam(month) ?? today.getMonth() + 1;
  const dayNum = parseNumberParam(day);

  // 현재 보고 있는 달력의 기준 날짜
  const currentDate = useMemo(() => {
    const safeMonth = Math.min(Math.max(monthNum, 1), 12);
    const maxDay = new Date(yearNum, safeMonth, 0).getDate();
    const safeDay = dayNum ? Math.min(Math.max(dayNum, 1), maxDay) : 1;
    return new Date(yearNum, safeMonth - 1, safeDay);
  }, [yearNum, monthNum, dayNum]);

  // 실제 선택된 날짜
  const selectedDate = useMemo(() => {
    if (!dayNum) return null;
    const safeMonth = Math.min(Math.max(monthNum, 1), 12);
    const maxDay = new Date(yearNum, safeMonth, 0).getDate();
    const safeDay = Math.min(Math.max(dayNum, 1), maxDay);
    return new Date(yearNum, safeMonth - 1, safeDay);
  }, [yearNum, monthNum, dayNum]);

  const { startDate, endDate } = useMemo(() => {
    return getMonthRange(currentDate);
  }, [currentDate]);

  const days = useDataGrid(startDate, endDate);

  const onClickDay = useCallback(
    (date: Date) => {
      navigate(`${createRecruitPath(date)}/${date.getDate()}`);
    },
    [navigate],
  );

  const onPrevMonth = useCallback(() => {
    const prevDate = subMonths(currentDate, 1);
    navigate(createRecruitPath(prevDate));
  }, [currentDate, navigate]);

  const onNextMonth = useCallback(() => {
    const nextDate = addMonths(currentDate, 1);
    navigate(createRecruitPath(nextDate));
  }, [currentDate, navigate]);

  const isSelected = useCallback(
    (date: Date) => (selectedDate ? isSameDay(date, selectedDate) : false),
    [selectedDate],
  );

  const isCurrentMonth = useCallback(
    (date: Date) =>
      date.getFullYear() === currentDate.getFullYear() &&
      date.getMonth() === currentDate.getMonth(),
    [currentDate],
  );

  const helpers = useMemo(
    () => ({
      isSelected,
      isCurrentMonth,
      onClickDay,
      onPrevMonth,
      onNextMonth,
    }),
    [isSelected, isCurrentMonth, onClickDay, onPrevMonth, onNextMonth],
  );

  return {
    currentDate,
    today,
    startDate,
    endDate,
    selectedDate,
    days,
    helpers,
  };
};
