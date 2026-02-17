import { z } from 'zod';

import { apiClient } from '@/shared/api/apiClient';
import type {
  CoverLetter,
  CreateCoverLetterRequest,
  CreateCoverLetterResponse,
  RecentCoverLetter,
} from '@/shared/types/coverLetter';

interface SearchCoverLettersParams {
  searchWord?: string;
  size?: number;
  page?: number;
}

interface PageInfo {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface CoverLetterSearchResponse {
  coverLetters: RecentCoverLetter[];
  page: PageInfo;
}

const CreateCoverLetterResponseSchema = z.object({
  coverLetterId: z.number(),
});

// --- Existing Search/Get APIs ---

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
): Promise<CoverLetter> => {
  if (!coverLetterId || Number.isNaN(coverLetterId) || coverLetterId <= 0) {
    throw new Error(`Invalid coverLetterId: ${coverLetterId}`);
  }

  return apiClient.get<CoverLetter>({
    endpoint: `/coverletter/${coverLetterId}`,
  });
};

// --- Added Mutation APIs (Moved from features) ---

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
  payload: CoverLetter,
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
