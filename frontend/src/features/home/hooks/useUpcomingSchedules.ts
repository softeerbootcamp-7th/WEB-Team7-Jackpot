import { useMemo } from 'react';

import {
  MAX_COVER_LETTER_SIZE_PER_DEADLINE,
  MAX_DEADLINE_SIZE,
} from '@/features/home/constants';
import { useUpcomingDeadlines } from '@/features/home/hooks/queries/useHomeQueries';
import { getDDay, getKoreanDate } from '@/shared/utils/dates';

export const useUpcomingSchedules = () => {
  // 데이터 패칭
  const { data } = useUpcomingDeadlines(
    MAX_DEADLINE_SIZE,
    MAX_COVER_LETTER_SIZE_PER_DEADLINE,
  );

  // UI에서 바로 렌더링할 수 있도록 데이터 가공 (메모이제이션으로 성능 최적화)
  const schedules = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      id: item.deadline, // React key 용도
      dateText: getKoreanDate(item.deadline), // "M월 D일" 포맷 (Intl.DateTimeFormat 적용됨)
      dDay: getDDay(item.deadline),
      companyList: item.coverLetters.map((cl) => ({
        coverLetterId: cl.coverLetterId,
        company: cl.companyName,
        position: cl.jobPosition,
      })),
    }));
  }, [data]);

  return {
    schedules,
    isEmpty: schedules.length === 0,
  };
};
