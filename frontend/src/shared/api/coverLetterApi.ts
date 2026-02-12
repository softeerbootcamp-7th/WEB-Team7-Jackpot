import { getAccessToken } from '@/features/auth/libs/tokenStore';
import type {
  CoverLetter,
  RecentCoverLetter,
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
      headers: {
        Authorization: getAccessToken(),
      },
    },
  );

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return response.json();
};

export const getCoverLetter = async (
  coverLetterId: number,
): Promise<CoverLetter> => {
  const response = await fetch(`${BASE_URL}/coverletter/${coverLetterId}`, {
    headers: {
      Authorization: getAccessToken(),
    },
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return response.json();
};
