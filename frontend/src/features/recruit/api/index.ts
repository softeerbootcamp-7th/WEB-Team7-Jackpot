import { z } from 'zod';

import { fetchCalendarDatesMock } from '@/features/recruit/api/mockData';
import type {
  CalendarRequest,
  CalendarResponse,
} from '@/features/recruit/types';
import { apiClient } from '@/shared/api/apiClient';

const isDev = import.meta.env.DEV;

const ApiApplyHalfSchema = z.enum(['FIRST_HALF', 'SECOND_HALF']);

const CoverLetterItemSchema = z.object({
  coverLetterId: z.number(),
  companyName: z.string(),
  jobPosition: z.string(),
  applyYear: z.number(),
  applyHalf: ApiApplyHalfSchema,
  deadline: z.string().date(),
  questionCount: z.number(),
});

const CalendarResponseSchema = z.object({
  totalCount: z.number(),
  coverLetters: z.array(CoverLetterItemSchema),
  hasNext: z.boolean(),
});

export const fetchCalendarDates = async (
  params: CalendarRequest,
  lastIdParam?: number,
): Promise<CalendarResponse> => {
  if (isDev) {
    return fetchCalendarDatesMock(params, lastIdParam);
  }

  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    size: String(params.size ?? 7),
    isShared: String(params.isShared ?? true),
  });

  if (lastIdParam !== undefined) {
    queryParams.append('lastCoverLetterId', String(lastIdParam));
  }

  const response = await apiClient.get({
    endpoint: `/coverletter/all?${queryParams.toString()}`,
  });

  return CalendarResponseSchema.parse(response);
};
