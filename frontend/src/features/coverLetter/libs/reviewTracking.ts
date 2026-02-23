import type { Review } from '@/shared/types/review';

export type ReviewRangeMap = Record<number, { start: number; end: number }>;

interface ReconcileReviewTrackingStateParams {
  reviews: Review[];
  prevRemainingChars: Record<number, number>;
  prevLastKnownRanges: ReviewRangeMap;
}

interface ReconcileReviewTrackingStateResult {
  nextRemainingChars: Record<number, number>;
  nextLastKnownRanges: ReviewRangeMap;
}

export const reconcileReviewTrackingState = ({
  reviews,
  prevRemainingChars,
  prevLastKnownRanges,
}: ReconcileReviewTrackingStateParams): ReconcileReviewTrackingStateResult => {
  const nextRemainingChars = { ...prevRemainingChars };
  const nextLastKnownRanges = { ...prevLastKnownRanges };
  const existingIds = new Set<number>();

  for (const review of reviews) {
    existingIds.add(review.id);
    if (review.range.start < 0 || review.range.end <= review.range.start) {
      continue;
    }

    const length = review.range.end - review.range.start;
    const prev = nextRemainingChars[review.id];
    nextRemainingChars[review.id] =
      prev === undefined ? length : Math.min(prev, length);
    nextLastKnownRanges[review.id] = {
      start: review.range.start,
      end: review.range.end,
    };
  }

  for (const id of Object.keys(nextRemainingChars).map(Number)) {
    if (!existingIds.has(id)) delete nextRemainingChars[id];
  }
  for (const id of Object.keys(nextLastKnownRanges).map(Number)) {
    if (!existingIds.has(id)) delete nextLastKnownRanges[id];
  }

  return {
    nextRemainingChars,
    nextLastKnownRanges,
  };
};
