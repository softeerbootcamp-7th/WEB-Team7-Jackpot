import { z } from 'zod';

import type {
  CalendarRequest,
  CalendarResponse,
  QnAListResponse,
} from '@/features/recruit/types';
import { apiClient } from '@/shared/api/apiClient';
import type { Category } from '@/shared/types/coverLetter';

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

const QnAListResponseSchema = z.object({
  qnAs: z.array(
    z.object({
      qnAId: z.number(),
      question: z.string(),
      category: z.string().transform((val) => val as Category),
    }),
  ),
});

export const fetchCalendarDates = async (
  params: CalendarRequest,
  lastIdParam?: number,
): Promise<CalendarResponse> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    size: String(params.size ?? 7), // [박소민] 기본값은 7로 설정
    isShared: String(params.isShared ?? false), // [박소민] 기본값은 false로 설정
  });

  if (lastIdParam !== undefined) {
    queryParams.append('lastCoverLetterId', String(lastIdParam));
  }

  const response = await apiClient.get({
    endpoint: `/coverletter/all?${queryParams.toString()}`,
  });

  return CalendarResponseSchema.parse(response);
};

export const fetchQnAList = async (
  qnAIds: number[],
): Promise<QnAListResponse> => {
  const queryParams = new URLSearchParams();
  qnAIds.forEach((id) => queryParams.append('qnAIds', String(id)));

  const response = await apiClient.get({
    endpoint: `/qna/all?${queryParams.toString()}`,
  });

  return QnAListResponseSchema.parse(response);
};
