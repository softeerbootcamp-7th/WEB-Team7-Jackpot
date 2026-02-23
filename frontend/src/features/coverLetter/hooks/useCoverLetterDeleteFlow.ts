import { type RefObject, useCallback } from 'react';

import { getCaretPosition } from '@/features/coverLetter/libs/caret';
import {
  computeDeleteEdit,
  type DeleteDirection,
} from '@/features/coverLetter/libs/deleteUtils';
import type { Review } from '@/shared/types/review';

interface UseCoverLetterDeleteFlowParams {
  contentRef: RefObject<HTMLDivElement | null>;
  isComposingRef: RefObject<boolean>;
  latestTextRef: RefObject<string>;
  caretOffsetRef: RefObject<number>;
  reviewsRef: RefObject<Review[]>;
  reviewRemainingCharsRef: RefObject<Record<number, number>>;
  reviewLastKnownRangesRef: RefObject<
    Record<number, { start: number; end: number }>
  >;
  syncDOMToState: () => void;
  updateText: (
    newText: string,
    options?: {
      skipSocket?: boolean;
      skipVersionIncrement?: boolean;
      reviewsForMapping?: Review[];
      removeWholeReviewIds?: number[];
    },
  ) => void;
  onDeleteReviewsByText?: (reviewIds: number[]) => void;
}

export const useCoverLetterDeleteFlow = ({
  contentRef,
  isComposingRef,
  latestTextRef,
  caretOffsetRef,
  reviewsRef,
  reviewRemainingCharsRef,
  reviewLastKnownRangesRef,
  syncDOMToState,
  updateText,
  onDeleteReviewsByText,
}: UseCoverLetterDeleteFlowParams) => {
  const applyDeleteByDirection = useCallback(
    (direction: DeleteDirection) => {
      if (!contentRef.current) return;
      if (isComposingRef.current) return;

      syncDOMToState();

      const { start, end } = getCaretPosition(contentRef.current);
      const result = computeDeleteEdit({
        direction,
        currentText: latestTextRef.current,
        caretStart: start,
        caretEnd: end,
        reviews: reviewsRef.current,
        reviewRemainingChars: reviewRemainingCharsRef.current,
        reviewLastKnownRanges: reviewLastKnownRangesRef.current,
      });

      caretOffsetRef.current = result.caretOffset;
      // 낙관적 업데이트: API 호출 결과를 기다리지 않고 로컬 ref를 즉시 갱신한다.
      // API 실패 시 이 refs는 stale 상태가 되지만, CoverLetterContent의
      // useEffect([reviews])가 reviews prop 변경 시 자동으로 재동기화한다.
      // 텍스트 자체도 이미 변경·전파된 상태이므로 refs만 롤백하는 것은 불완전하며,
      // 텍스트까지 되돌리는 것은 사용자 입력을 자동 취소하는 UX 문제가 있다.
      reviewRemainingCharsRef.current = result.nextReviewRemainingChars;
      reviewLastKnownRangesRef.current = result.nextReviewLastKnownRanges;
      reviewsRef.current = result.nextReviews;

      if (result.deletedReviewIds.length > 0) {
        onDeleteReviewsByText?.([...new Set(result.deletedReviewIds)]);
      }

      updateText(result.newText, {
        reviewsForMapping: result.reviewsForMapping,
        removeWholeReviewIds: result.deletedWholeReviewIdsForPatch,
      });
    },
    [
      contentRef,
      isComposingRef,
      syncDOMToState,
      latestTextRef,
      reviewsRef,
      reviewRemainingCharsRef,
      reviewLastKnownRangesRef,
      caretOffsetRef,
      onDeleteReviewsByText,
      updateText,
    ],
  );

  return { applyDeleteByDirection };
};
