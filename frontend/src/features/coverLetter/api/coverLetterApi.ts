import type { GetScrapsResponse } from '@/features/coverLetter/types/coverLetter';
import { apiClient } from '@/shared/api/apiClient';

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

interface SharedLinkResponse {
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
