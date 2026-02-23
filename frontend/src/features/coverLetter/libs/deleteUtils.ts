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
  reviewLastKnownRanges: ReviewRangeMap;
}

interface ComputeDeleteEditResult {
  newText: string;
  caretOffset: number;
  reviewsForMapping?: Review[];
  deletedReviewIds: number[];
  deletedWholeReviewIdsForPatch: number[];
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
  beforeReviews: Review[],
  afterReviews: Review[],
  lastKnownRanges: ReviewRangeMap,
): number[] => {
  const afterById = new Map(afterReviews.map((r) => [r.id, r]));
  const deletedReviewIds: number[] = [];

  for (const before of beforeReviews) {
    if (before.range.start < 0 || before.range.end <= before.range.start) continue;
    const after = afterById.get(before.id);
    if (!after || after.range.start < 0) {
      deletedReviewIds.push(before.id);
      delete lastKnownRanges[before.id];
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

    // 삭제 후 정규화된 범위를 계산한다.
    // 이 결과를 "삭제 전 vs 삭제 후" 범위 비교에 사용한다.
    const nextNormalizedReviews = updateReviewRanges(
      normalizedReviewsForMapping,
      deleteStart,
      deleteEnd - deleteStart,
      0,
      newText,
    );

    // 삭제 전 유효했던 범위가 삭제 후 무효(-1)가 된 리뷰를 검출한다.
    // remainingChars 카운터 방식과 달리, 리뷰 영역 안에서 타이핑한 뒤 지워도
    // 범위 추적이 정확하게 동작한다.
    deletedReviewIds = collectDeletedReviewIds(
      normalizedReviewsForMapping,
      nextNormalizedReviews,
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

    // nextReviews는 원본 reviews 기준으로 계산해 stale 범위 부활을 막는다.
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
    nextReviewLastKnownRanges,
    nextReviews,
  };
};
