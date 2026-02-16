import { apiClient } from '@/shared/api/apiClient';

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
  return apiClient.get<GetReviewsResponse>({
    endpoint: `/qna/${qnaId}/reviews/all`,
  });
};
