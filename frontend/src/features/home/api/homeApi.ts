import type {
  CalendarDatesResponse,
  HomeCountResponse,
  UpcomingDeadlinesResponse,
} from '@/features/home/types/home';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// TODO: 추후에 inmemory로 옮기면서 코드 수정 예정
function getToken(): string {
  return localStorage.getItem('accessToken') || '';
}

export const fetchHomeCount = async (
  date: string,
): Promise<HomeCountResponse> => {
  const params = new URLSearchParams({ date });

  const response = await fetch(
    `${BASE_URL}/coverletter/count?${params.toString()}`,
    {
      headers: {
        Authorization: `${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch home count');
  }

  return response.json();
};

interface FetchUpcomingDeadlinesParams {
  date: string;
  maxDeadLineSize: number;
  maxCoverLetterSizePerDeadLine?: number;
}

export const fetchUpcomingDeadlines = async ({
  date,
  maxDeadLineSize = 3,
  maxCoverLetterSizePerDeadLine = 2,
}: FetchUpcomingDeadlinesParams): Promise<UpcomingDeadlinesResponse> => {
  const params = new URLSearchParams({
    date,
    maxDeadLineSize: maxDeadLineSize.toString(),
    maxCoverLetterSizePerDeadLine: maxCoverLetterSizePerDeadLine.toString(),
  });

  const response = await fetch(
    `${BASE_URL}/coverletter/upcoming?${params.toString()}`,
    {
      headers: {
        Authorization: `${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch upcoming deadlines');
  }

  return response.json();
};

interface FetchCalendarDatesParams {
  startDate: string;
  endDate: string;
}

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
        Authorization: `${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch calendar dates');
  }

  return response.json();
};
