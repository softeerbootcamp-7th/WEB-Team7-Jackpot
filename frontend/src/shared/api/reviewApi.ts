import { getAccessToken } from '@/features/auth/libs/tokenStore';
import { parseErrorResponse } from '@/shared/utils/fetchUtils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiReview {
  id: number;
  sender: { id: string; nickname: string };
  originText: string;
  suggest: string | null;
  comment: string;
  createdAt: string;
}

interface GetReviewsResponse {
  reviews: ApiReview[];
}

// 아직 백엔드 API 개발 전입니다.
export const getReviewsByQnaId = async (
  qnaId: number,
): Promise<GetReviewsResponse> => {
  const response = await fetch(`${BASE_URL}/qna/${qnaId}/reviews/all`, {
    headers: {
      Authorization: getAccessToken(),
    },
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return (await response.json()) as GetReviewsResponse;
};
