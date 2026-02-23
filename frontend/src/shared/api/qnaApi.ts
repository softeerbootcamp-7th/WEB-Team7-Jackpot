import z from 'zod';

import type { QnASearchResponse } from '@/features/library/types';
import { apiClient } from '@/shared/api/apiClient';
import { CATEGORY_VALUES } from '@/shared/constants/createCoverLetter';
import type { QnA } from '@/shared/types/qna';

const CategoryEnum = z.enum(CATEGORY_VALUES);

// 검색용 QnA 아이템 스키마
const QnAsSearchSchema = z.object({
  qnAId: z.number(),
  companyName: z.string(),
  jobPosition: z.string(),
  applySeason: z.string().nullable(),
  question: z.string(),
  answer: z.string().nullable(),
  coverLetterId: z.number(),
  questionCategoryType: CategoryEnum.nullable().catch(null),
});

// 검색 응답 스키마
export const SearchLibraryResponseSchema = z.object({
  libraryCount: z.number(),
  libraries: z.array(z.string()),
  qnACount: z.number(),
  qnAs: z.array(QnAsSearchSchema),
  hasNext: z.boolean(),
});

// 하나의 자기소개서의 QnA id 목록 조회
export const getQnAIdList = async ({
  coverLetterId,
}: {
  coverLetterId: number;
}): Promise<number[]> => {
  const params = new URLSearchParams();
  params.append('coverLetterId', String(coverLetterId));

  return apiClient.get<number[]>({
    endpoint: `/qna/id/all?${params.toString()}`,
  });
};

// 단건 QnA 조회
export const getQnA = async (qnaId: number): Promise<QnA> => {
  return apiClient.get<QnA>({
    endpoint: `/qna/${qnaId}`,
  });
};

interface UpdateQnAResponse {
  qnAId: number;
  modifiedAt: string;
}

// QnA 수정
export const updateQnA = async ({
  qnAId,
  answer,
}: {
  qnAId: number;
  answer: string;
}): Promise<UpdateQnAResponse> => {
  if (!qnAId || Number.isNaN(qnAId) || qnAId <= 0) {
    throw new Error(`Invalid qnAId: ${qnAId}`);
  }

  return apiClient.put<UpdateQnAResponse>({
    endpoint: `/qna`,
    body: { qnAId, answer },
  });
};

// 라이브러리 검색

/**
 * 통합 검색 (라이브러리 + 질문)
 */
export const searchLibrary = async (
  searchWord: string,
  lastQnAId?: number,
  size = 10,
): Promise<QnASearchResponse> => {
  const params = new URLSearchParams({
    searchWord,
    size: String(size),
  });

  if (lastQnAId !== undefined && lastQnAId !== null) {
    params.append('lastQnAId', String(lastQnAId));
  }

  const response = await apiClient.get({
    endpoint: `/search/library?${params.toString()}`,
  });

  return SearchLibraryResponseSchema.parse(response);
};
