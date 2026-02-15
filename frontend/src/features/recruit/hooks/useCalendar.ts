import { useCallback, useMemo } from 'react';

import { useNavigate, useParams } from 'react-router';

import { useDataGrid } from '@/shared/hooks/useDataGrid';
import { getMonthRange, isSameDay } from '@/shared/utils/dates';

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

  // 현재 보고 있는 달력의 기준 날짜 (URL 파라미터 기반)
  const currentDate = useMemo(() => {
    const safeMonth = Math.min(Math.max(monthNum, 1), 12);
    // dayNum이 없으면 1일로 설정
    const safeDay = dayNum ? Math.min(Math.max(dayNum, 1), 31) : 1;
    return new Date(yearNum, safeMonth - 1, safeDay);
  }, [yearNum, monthNum, dayNum]);

  // 실제 선택된 날짜 (day 파라미터가 있을 때만 유효)
  const selectedDate = useMemo(() => {
    if (!dayNum) return null;
    const safeMonth = Math.min(Math.max(monthNum, 1), 12);
    const safeDay = Math.min(Math.max(dayNum, 1), 31);
    return new Date(yearNum, safeMonth - 1, safeDay);
  }, [yearNum, monthNum, dayNum]);

  const { startDate, endDate } = useMemo(() => {
    return getMonthRange(currentDate);
  }, [currentDate]);

  const days = useDataGrid(startDate, endDate);

  // [박소민] TODO: 핸들러 경량화

  // 1. 날짜 클릭 시 URL 이동
  const onClickDay = useCallback(
    (date: Date) => {
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();
      navigate(`/recruit/${y}/${m}/${d}`);
    },
    [navigate],
  );

  // 2. 이전 달로 이동
  const onPrevMonth = useCallback(() => {
    const prevDate = new Date(yearNum, monthNum - 2, 1); // monthNum은 1-based이므로 -2
    const y = prevDate.getFullYear();
    const m = prevDate.getMonth() + 1;
    navigate(`/recruit/${y}/${m}`);
  }, [yearNum, monthNum, navigate]);

  // 3. 다음 달로 이동
  const onNextMonth = useCallback(() => {
    const nextDate = new Date(yearNum, monthNum, 1); // monthNum은 1-based이므로 그냥 넣으면 다음달 인덱스
    const y = nextDate.getFullYear();
    const m = nextDate.getMonth() + 1;
    navigate(`/recruit/${y}/${m}`);
  }, [yearNum, monthNum, navigate]);

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

  // 4. 헬퍼 객체 메모이제이션 (함수들 포함)
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
