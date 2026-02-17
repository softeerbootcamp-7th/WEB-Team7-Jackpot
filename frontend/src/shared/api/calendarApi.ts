import { getAccessToken } from '@/features/auth/libs/tokenStore';
import type { CalendarDatesResponse } from '@/features/home/types/home';
import { parseErrorResponse } from '@/shared/utils/fetchUtils';

interface FetchCalendarDatesParams {
  startDate: string;
  endDate: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchCalendarDates = async ({
  startDate,
  endDate,
}: FetchCalendarDatesParams): Promise<CalendarDatesResponse> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${BASE_URL}/coverletter/calendar?${params.toString()}`,
    {
      headers: {
        Authorization: getAccessToken(),
      },
    },
  );

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
};
