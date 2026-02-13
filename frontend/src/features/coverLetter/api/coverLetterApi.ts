import { getAccessToken } from '@/features/auth/libs/tokenStore';
import type { GetScrapsResponse } from '@/features/coverLetter/types/coverLetter';
import { parseErrorResponse } from '@/shared/utils/fetchUtils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface GetScrapsParams {
  searchWord?: string;
  size?: number;
  lastQnAId?: number;
}

export const fetchScraps = async ({
  searchWord,
  size,
  lastQnAId,
}: GetScrapsParams = {}): Promise<GetScrapsResponse> => {
  const params = new URLSearchParams();

  if (searchWord) params.set('searchWord', searchWord);
  if (size !== undefined) params.set('size', String(size));
  if (lastQnAId !== undefined) params.set('lastQnaId', String(lastQnAId));

  const response = await fetch(
    `${BASE_URL}/search/scrap?${params.toString()}`,
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

interface SharedLinkResponse {
  active: boolean;
  shareLinkId: string;
}

export const fetchSharedLink = async ({
  coverLetterId,
}: {
  coverLetterId: number;
}): Promise<SharedLinkResponse> => {
  const response = await fetch(
    `${BASE_URL}/coverletter/${coverLetterId}/share-link`,
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

export const toggleSharedLinkStatus = async ({
  coverLetterId,
  active,
}: {
  coverLetterId: number;
  active: boolean;
}): Promise<SharedLinkResponse> => {
  const response = await fetch(
    `${BASE_URL}/coverletter/${coverLetterId}/share-link`,
    {
      method: 'PATCH',
      headers: {
        Authorization: getAccessToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active }),
    },
  );

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return response.json();
};
