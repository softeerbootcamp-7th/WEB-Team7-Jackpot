import { useMemo } from 'react';

import { useCalendarDates } from '@/features/home/hooks/queries/useHomeQueries';
import type {
  MyApplicationCalendarData,
  MyApplicationCalendarWeek,
} from '@/features/home/types/home';
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  getISODate,
  getTodayISODate,
  startOfWeek,
} from '@/shared/utils/dates';

export const useMyApplicationCalendar = () => {
  // 1. 이번 주 일요일부터 2주 뒤 토요일까지 날짜 계산
  const { startDate, endDate, dateList } = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today); // 이번 주 일요일
    const end = endOfWeek(addWeeks(start, 2)); // 2주 뒤 토요일 (총 3주)

    return {
      startDate: getISODate(start),
      endDate: getISODate(end),
      dateList: eachDayOfInterval({ start, end }),
    };
  }, []);

  // 2. API 데이터 패칭
  const data = useCalendarDates(startDate, endDate);

  // 3. UI 렌더링에 필요한 형태로 데이터 가공
  const calendarDays: MyApplicationCalendarWeek = useMemo(() => {
    const todayISO = getTodayISODate();
    const scheduleDates = new Set(data); // O(1) 조회를 위해 Set 사용

    return dateList.map((date) => {
      const dateString = getISODate(date);
      return {
        dateString,
        day: date.getDate(),
        dayOfWeek: date.getDay(),
        isToday: dateString === todayISO,
        isPast: dateString < todayISO,
        hasSchedule: scheduleDates.has(dateString),
      };
    });
  }, [dateList, data]);

  // 4. 7일씩 배열 쪼개기 (1차원 배열 -> 2차원 배열)
  const weeks: MyApplicationCalendarData = useMemo(() => {
    const result: MyApplicationCalendarData = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  return {
    weeks,
  };
};
