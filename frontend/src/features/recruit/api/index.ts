import { z } from 'zod';

import type {
  CalendarRequest,
  CalendarResponse,
} from '@/features/recruit/types';
import { apiClient } from '@/shared/api/apiClient';
import { CATEGORY_VALUES } from '@/shared/constants/createCoverLetter';

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

export const CategorySchema = z.enum(CATEGORY_VALUES);

const QnAListResponseSchema = z.object({
  qnAs: z.array(
    z.object({
      qnAId: z.number(),
      question: z.string(),
      category: CategorySchema,
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
): Promise<z.infer<typeof QnAListResponseSchema>> => {
  if (qnAIds.length === 0) {
    return { qnAs: [] };
  }
  const queryParams = new URLSearchParams();
  qnAIds.forEach((id) => queryParams.append('qnAIds', String(id)));

  const response = await apiClient.get({
    endpoint: `/qna/all?${queryParams.toString()}`,
  });

  return QnAListResponseSchema.parse(response);
};
