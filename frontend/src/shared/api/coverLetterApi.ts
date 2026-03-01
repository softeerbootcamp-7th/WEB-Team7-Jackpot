import { z } from 'zod';

import type { GetScrapsResponse } from '@/features/coverLetter/types/coverLetter';
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
  applyYear: z.number().optional(),
  applyHalf: ApiApplyHalfSchema.optional(),
  deadline: z.string().optional(),
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
    size: String(params.size ?? 7),
  });

  // params.isShared가 명시적으로 존재할 때만 파라미터에 추가
  if (params.isShared !== undefined) {
    queryParams.append('isShared', String(params.isShared));
  }
  if (lastIdParam !== undefined) {
    queryParams.append('lastCoverLetterId', String(lastIdParam));
  }

  const response = await apiClient.get({
    endpoint: `/coverletter/all?${queryParams.toString()}`,
  });

  return FilterResponseSchema.parse(response);
};

interface GetScrapsParams {
  searchWord?: string;
  size?: number;
  lastQnaId?: number;
}

// lastQnaId: 백엔드 API 명세에 따라 'Qna' 대문자 표기 유지
export const fetchScraps = async ({
  searchWord,
  size,
  lastQnaId,
}: GetScrapsParams = {}): Promise<GetScrapsResponse> => {
  const params = new URLSearchParams();

  if (searchWord) params.set('searchWord', searchWord);
  if (size !== undefined) params.set('size', String(size));
  if (lastQnaId !== undefined) params.set('lastQnaId', String(lastQnaId));

  return apiClient.get<GetScrapsResponse>({
    endpoint: `/search/scrap?${params.toString()}`,
  });
};

export interface SharedLinkResponse {
  active: boolean;
  shareLinkId: string;
}

export const fetchSharedLink = async ({
  coverLetterId,
}: {
  coverLetterId: number;
}): Promise<SharedLinkResponse> => {
  return apiClient.get<SharedLinkResponse>({
    endpoint: `/coverletter/${coverLetterId}/share-link`,
  });
};

export const toggleSharedLinkStatus = async ({
  coverLetterId,
  active,
}: {
  coverLetterId: number;
  active: boolean;
}): Promise<SharedLinkResponse> => {
  return apiClient.patch<SharedLinkResponse>({
    endpoint: `/coverletter/${coverLetterId}/share-link`,
    body: { active },
  });
};
