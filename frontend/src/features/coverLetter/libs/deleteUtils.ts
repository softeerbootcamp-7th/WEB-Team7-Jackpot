import type { ReviewRangeMap } from '@/features/coverLetter/libs/reviewTracking';
import { updateReviewRanges } from '@/shared/hooks/useReviewState/helpers';
import type { Review } from '@/shared/types/review';

export type { ReviewRangeMap };
export type DeleteDirection = 'backward' | 'forward';

interface ComputeDeleteEditInput {
  direction: DeleteDirection;
  currentText: string;
  caretStart: number;
  caretEnd: number;
  reviews: Review[];
  reviewRemainingChars: Record<number, number>;
  reviewLastKnownRanges: ReviewRangeMap;
}

interface ComputeDeleteEditResult {
  newText: string;
  caretOffset: number;
  reviewsForMapping?: Review[];
  deletedReviewIds: number[];
  deletedWholeReviewIdsForPatch: number[];
  nextReviewRemainingChars: Record<number, number>;
  nextReviewLastKnownRanges: ReviewRangeMap;
  nextReviews: Review[];
}

const normalizeReviewsForMapping = (
  reviews: Review[],
  currentTextLength: number,
  lastKnownRanges: ReviewRangeMap,
): Review[] => {
  return reviews.map((review) => {
    const knownRange = lastKnownRanges[review.id];
    const rawStart =
      review.range.start >= 0 && review.range.end > review.range.start
        ? review.range.start
        : (knownRange?.start ?? -1);
    const rawEnd =
      review.range.start >= 0 && review.range.end > review.range.start
        ? review.range.end
        : (knownRange?.end ?? -1);

    const start = Math.max(0, Math.min(rawStart, currentTextLength));
    const end = Math.max(start, Math.min(rawEnd, currentTextLength));
    if (end <= start) {
      return {
        ...review,
        range: { start: -1, end: -1 },
      };
    }

    return {
      ...review,
      range: { start, end },
    };
  });
};

const collectDeletedReviewIds = (
  reviews: Review[],
  deleteStart: number,
  deleteEnd: number,
  remainingByReview: Record<number, number>,
  lastKnownRanges: ReviewRangeMap,
) => {
  const deletedReviewIds: number[] = [];
  for (const review of reviews) {
    const reviewStart = review.range.start;
    const reviewEnd = review.range.end;
    if (reviewStart < 0 || reviewEnd <= reviewStart) continue;

    const overlapStart = Math.max(reviewStart, deleteStart);
    const overlapEnd = Math.min(reviewEnd, deleteEnd);
    const removedLength = Math.max(0, overlapEnd - overlapStart);
    if (removedLength === 0) continue;

    const initialLength = reviewEnd - reviewStart;
    const prevRemaining = remainingByReview[review.id] ?? initialLength;
    if (prevRemaining <= 0) continue;
    const nextRemaining = Math.max(0, prevRemaining - removedLength);
    remainingByReview[review.id] = nextRemaining;

    if (nextRemaining === 0) {
      deletedReviewIds.push(review.id);
      delete lastKnownRanges[review.id];
    }
  }

  return deletedReviewIds;
};

const shiftLastKnownRangesAfterDelete = (
  reviews: Review[],
  deleteStart: number,
  deleteEnd: number,
  deletedReviewIds: number[],
  lastKnownRanges: ReviewRangeMap,
) => {
  const deletedLength = deleteEnd - deleteStart;
  const mapPositionAfterDelete = (position: number) => {
    if (position <= deleteStart) return position;
    if (position >= deleteEnd) return position - deletedLength;
    return deleteStart;
  };

  const deletedSet = new Set(deletedReviewIds);
  for (const review of reviews) {
    if (deletedSet.has(review.id)) continue;
    const reviewStart = review.range.start;
    const reviewEnd = review.range.end;
    if (reviewStart < 0 || reviewEnd <= reviewStart) continue;
    const nextStart = mapPositionAfterDelete(reviewStart);
    const nextEnd = mapPositionAfterDelete(reviewEnd);
    if (nextEnd <= nextStart) {
      delete lastKnownRanges[review.id];
    } else {
      lastKnownRanges[review.id] = {
        start: nextStart,
        end: nextEnd,
      };
    }
  }
};

export const computeDeleteEdit = ({
  direction,
  currentText,
  caretStart,
  caretEnd,
  reviews,
  reviewRemainingChars,
  reviewLastKnownRanges,
}: ComputeDeleteEditInput): ComputeDeleteEditResult => {
  let newText = currentText;
  let deleteStart = caretStart;
  let deleteEnd = caretEnd;
  let caretOffset = caretStart;

  if (caretStart !== caretEnd) {
    newText = currentText.slice(0, caretStart) + currentText.slice(caretEnd);
    caretOffset = caretStart;
  } else if (direction === 'backward' && caretStart > 0) {
    deleteStart = caretStart - 1;
    deleteEnd = caretStart;
    newText =
      currentText.slice(0, caretStart - 1) + currentText.slice(caretEnd);
    caretOffset = caretStart - 1;
  } else if (direction === 'forward' && caretStart < currentText.length) {
    deleteStart = caretStart;
    deleteEnd = caretStart + 1;
    newText =
      currentText.slice(0, caretStart) + currentText.slice(caretEnd + 1);
    caretOffset = caretStart;
  }

  if (newText === '') caretOffset = 0;

  const nextReviewRemainingChars = { ...reviewRemainingChars };
  const nextReviewLastKnownRanges = { ...reviewLastKnownRanges };
  let nextReviews = reviews;
  let reviewsForMapping: Review[] | undefined;
  let deletedReviewIds: number[] = [];
  const deletedWholeReviewIdsForPatch: number[] = [];

  if (deleteEnd > deleteStart) {
    const normalizedReviewsForMapping = normalizeReviewsForMapping(
      reviews,
      currentText.length,
      nextReviewLastKnownRanges,
    );
    reviewsForMapping = normalizedReviewsForMapping;

    deletedReviewIds = collectDeletedReviewIds(
      normalizedReviewsForMapping,
      deleteStart,
      deleteEnd,
      nextReviewRemainingChars,
      nextReviewLastKnownRanges,
    );
    deletedWholeReviewIdsForPatch.push(...deletedReviewIds);

    shiftLastKnownRangesAfterDelete(
      normalizedReviewsForMapping,
      deleteStart,
      deleteEnd,
      deletedReviewIds,
      nextReviewLastKnownRanges,
    );

    nextReviews = updateReviewRanges(
      reviews,
      deleteStart,
      deleteEnd - deleteStart,
      0,
      newText,
    );
  }

  return {
    newText,
    caretOffset,
    reviewsForMapping,
    deletedReviewIds,
    deletedWholeReviewIdsForPatch,
    nextReviewRemainingChars,
    nextReviewLastKnownRanges,
    nextReviews,
  };
};
