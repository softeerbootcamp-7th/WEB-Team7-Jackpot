import { z } from 'zod';

import { apiClient } from '@/shared/api/apiClient';
import { CATEGORY_VALUES } from '@/shared/constants/createCoverLetter';

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
