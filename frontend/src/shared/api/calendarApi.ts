import { z } from 'zod';

import type { CalendarDatesResponse } from '@/features/home/types/home';
import { apiClient } from '@/shared/api/apiClient';

interface FetchCalendarDatesParams {
  startDate: string;
  endDate: string;
}

// 응답 데이터 검증을 위한 Zod Schema
const CalendarDatesResponseSchema = z.object({
  coverLetterDates: z.array(z.string()),
});

export const fetchCalendarDates = async ({
  startDate,
  endDate,
}: FetchCalendarDatesParams): Promise<CalendarDatesResponse> => {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
  }).toString();

  // apiClient가 BASE_URL과 Authorization 헤더를 자동으로 처리합니다.
  const response = await apiClient.get({
    endpoint: `/coverletter/calendar?${queryParams}`,
  });

  // Zod를 사용하여 응답 데이터의 유효성을 검사하고 파싱합니다.
  return CalendarDatesResponseSchema.parse(response) as CalendarDatesResponse;
};
