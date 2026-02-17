import { apiClient } from '@/shared/api/apiClient';

export interface ApiReview {
  id: number;
  sender: { id: string; nickname: string };
  originText: string;
  suggest: string | null;
  comment: string;
  createdAt: string;
  isApproved: boolean;
}

interface GetReviewsResponse {
  reviews: ApiReview[];
}

export const getReviewsByQnaId = async (
  qnaId: number,
): Promise<GetReviewsResponse> => {
  return apiClient.get<GetReviewsResponse>({
    endpoint: `/qna/${qnaId}/reviews/all`,
  });
};

export const deleteReview = async (
  qnaId: number,
  reviewId: number,
): Promise<void> => {
  return apiClient.delete<void>({
    endpoint: `/qna/${qnaId}/reviews/${reviewId}`,
  });
};

export interface CreateReviewRequest {
  version: number;
  startIdx: number;
  endIdx: number;
  originText: string;
  suggest: string;
  comment: string;
}

export const createReview = async (
  qnaId: number,
  body: CreateReviewRequest,
): Promise<void> => {
  return apiClient.post<void>({
    endpoint: `/qna/${qnaId}/reviews`,
    body,
  });
};

export interface UpdateReviewRequest {
  suggest: string;
  comment: string;
}

export const updateReview = async (
  qnaId: number,
  reviewId: number,
  body: UpdateReviewRequest,
): Promise<void> => {
  return apiClient.put<void>({
    endpoint: `/qna/${qnaId}/reviews/${reviewId}`,
    body,
  });
};

export const approveReview = async (
  qnaId: number,
  reviewId: number,
): Promise<void> => {
  return apiClient.patch<void>({
    endpoint: `/qna/${qnaId}/reviews/${reviewId}/approve`,
  });
};
