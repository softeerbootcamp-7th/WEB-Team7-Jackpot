import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  approveReview,
  createReview,
  type CreateReviewRequest,
  deleteReview,
  getReviewsByQnaId,
  updateReview,
  type UpdateReviewRequest,
} from '@/shared/api/reviewApi';

export const useReviewsByQnaId = (qnaId: number | undefined) => {
  return useQuery({
    queryKey: ['reviews', qnaId],
    queryFn: () => {
      if (qnaId == null) throw new Error('qnaId is required');
      return getReviewsByQnaId(qnaId);
    },
    enabled: qnaId != null,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDeleteReview = (qnaId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => {
      if (qnaId == null) {
        return Promise.reject(new Error('qnaId is required'));
      }
      return deleteReview(qnaId, reviewId);
    },
    onSuccess: () => {
      if (qnaId == null) return;

      queryClient.invalidateQueries({
        queryKey: ['reviews', qnaId],
      });
    },
  });
};

export const useCreateReview = (qnaId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateReviewRequest) => {
      if (qnaId == null) {
        return Promise.reject(new Error('qnaId is required'));
      }
      return createReview(qnaId, body);
    },
    onSuccess: () => {
      if (qnaId == null) return;

      queryClient.invalidateQueries({
        queryKey: ['reviews', qnaId],
      });
    },
  });
};

export const useUpdateReview = (qnaId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      body,
    }: {
      reviewId: number;
      body: UpdateReviewRequest;
    }) => {
      if (qnaId == null) {
        return Promise.reject(new Error('qnaId is required'));
      }
      return updateReview(qnaId, reviewId, body);
    },
    onSuccess: () => {
      if (qnaId == null) return;

      queryClient.invalidateQueries({
        queryKey: ['reviews', qnaId],
      });
    },
  });
};

export const useApproveReview = (qnaId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => {
      if (qnaId == null) {
        return Promise.reject(new Error('qnaId is required'));
      }
      return approveReview(qnaId, reviewId);
    },
    onSuccess: () => {
      if (qnaId == null) return;

      queryClient.invalidateQueries({
        queryKey: ['reviews', qnaId],
      });
    },
  });
};
