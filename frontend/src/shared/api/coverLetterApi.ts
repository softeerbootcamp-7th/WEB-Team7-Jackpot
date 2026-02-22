import { z } from 'zod';

import { apiClient } from '@/shared/api/apiClient';
import type {
  CoverLetterType,
  CreateCoverLetterRequest,
  CreateCoverLetterResponse,
  FilterRequest,
  FilterResponse,
  RecentCoverLetterType,
  UpdateCoverLetter,
} from '@/shared/types/coverLetter';

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

const FilterResponseSchema = z.object({
  totalCount: z.number(),
  coverLetters: z.array(CoverLetterItemSchema),
  hasNext: z.boolean(),
});

interface SearchCoverLettersParams {
  searchWord?: string;
  size?: number;
  page?: number;
}

interface PageInfo {
  number: number;
  size: number;
  totalElement: number;
  totalPage: number;
}

export interface CoverLetterSearchResponse {
  coverLetters: RecentCoverLetterType[];
  page: PageInfo;
}

const CreateCoverLetterResponseSchema = z.object({
  coverLetterId: z.number(),
});

export const searchCoverLetters = async ({
  searchWord,
  size = 9,
  page = 1,
}: SearchCoverLettersParams = {}): Promise<CoverLetterSearchResponse> => {
  const params = new URLSearchParams();

  if (searchWord) params.append('searchWord', searchWord);
  params.append('size', size.toString());
  // API는 0-based 페이지 번호를 기대하므로, 클라이언트에서 1-based 페이지 번호를 전달받아 0-based로 변환
  params.append('page', page.toString());

  return apiClient.get<CoverLetterSearchResponse>({
    endpoint: `/search/coverletter?${params.toString()}`,
  });
};

export const getCoverLetter = async (
  coverLetterId: number,
): Promise<CoverLetterType> => {
  if (!coverLetterId || Number.isNaN(coverLetterId) || coverLetterId <= 0) {
    throw new Error(`Invalid coverLetterId: ${coverLetterId}`);
  }

  return apiClient.get<CoverLetterType>({
    endpoint: `/coverletter/${coverLetterId}`,
  });
};

export const createCoverLetter = async (
  payload: CreateCoverLetterRequest,
): Promise<CreateCoverLetterResponse> => {
  const response = await apiClient.post({
    endpoint: '/coverletter',
    body: payload,
  });
  return CreateCoverLetterResponseSchema.parse(response);
};

export const updateCoverLetter = async (
  payload: UpdateCoverLetter,
): Promise<void> => {
  await apiClient.put({
    endpoint: '/coverletter',
    body: payload,
  });
};

export const deleteCoverLetter = async (
  coverLetterId: number,
): Promise<void> => {
  await apiClient.delete({
    endpoint: `/coverletter/${coverLetterId}`,
  });
};

export const fetchFilterCoverLetter = async (
  params: FilterRequest,
  lastIdParam?: number,
): Promise<FilterResponse> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    size: String(params.size ?? 7), //  기본값은 7로 설정
    isShared: String(params.isShared ?? false), //  기본값은 false로 설정
  });

  if (lastIdParam !== undefined) {
    queryParams.append('lastCoverLetterId', String(lastIdParam));
  }

  const response = await apiClient.get({
    endpoint: `/coverletter/all?${queryParams.toString()}`,
  });

  return FilterResponseSchema.parse(response);
};
