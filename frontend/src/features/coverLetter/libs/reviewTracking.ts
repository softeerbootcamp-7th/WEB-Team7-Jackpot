import type { Review } from '@/shared/types/review';

export type ReviewRangeMap = Record<number, { start: number; end: number }>;

interface ReconcileReviewTrackingStateParams {
  reviews: Review[];
  prevLastKnownRanges: ReviewRangeMap;
}

interface ReconcileReviewTrackingStateResult {
  nextLastKnownRanges: ReviewRangeMap;
}

export const reconcileReviewTrackingState = ({
  reviews,
  prevLastKnownRanges,
}: ReconcileReviewTrackingStateParams): ReconcileReviewTrackingStateResult => {
  const nextLastKnownRanges = { ...prevLastKnownRanges };
  const existingIds = new Set<number>();

  for (const review of reviews) {
    existingIds.add(review.id);
    if (review.range.start < 0 || review.range.end <= review.range.start) {
      continue;
    }
    nextLastKnownRanges[review.id] = {
      start: review.range.start,
      end: review.range.end,
    };
  }

  for (const id of Object.keys(nextLastKnownRanges).map(Number)) {
    if (!existingIds.has(id)) delete nextLastKnownRanges[id];
  }

  return { nextLastKnownRanges };
};
