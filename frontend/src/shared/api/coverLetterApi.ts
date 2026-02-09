import type { RecentCoverLetter } from '@/shared/types/coverLetter';

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

// TODO: 추후에 inmemory로 옮기면서 코드 수정 예정
function getToken(): string {
  return localStorage.getItem('accessToken') || '';
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

  const response = await fetch(
    `${BASE_URL}/search/coverletter?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`, // TODO: 토큰 가져오는 함수 변경
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search cover letters');
  }

  return response.json();
};
