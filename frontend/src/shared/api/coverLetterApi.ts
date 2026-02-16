import { apiClient } from '@/shared/api/apiClient';
import type {
  CoverLetter,
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
