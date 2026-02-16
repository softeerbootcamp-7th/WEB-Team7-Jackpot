import { z } from 'zod';

import { getAccessToken } from '@/features/auth/libs/tokenStore';
import { apiClient } from '@/shared/api/apiClient';
import type {
  CoverLetter,
  CreateCoverLetterRequest,
  CreateCoverLetterResponse,
  RecentCoverLetter,
  UpdateCoverLetterRequest,
} from '@/shared/types/coverLetter';
import { parseErrorResponse } from '@/shared/utils/fetchUtils';

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

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const response = await fetch(
    `${BASE_URL}/search/coverletter?${params.toString()}`,
    {
      headers: { Authorization: getAccessToken() },
    },
  );

  if (!response.ok) await parseErrorResponse(response);
  return response.json();
};

export const getCoverLetter = async (
  coverLetterId: number,
): Promise<CoverLetter> => {
  if (!coverLetterId || Number.isNaN(coverLetterId) || coverLetterId <= 0) {
    throw new Error(`Invalid coverLetterId: ${coverLetterId}`);
  }

  const response = await fetch(`${BASE_URL}/coverletter/${coverLetterId}`, {
    headers: { Authorization: getAccessToken() },
  });

  if (!response.ok) await parseErrorResponse(response);
  return response.json();
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
  payload: UpdateCoverLetterRequest,
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
