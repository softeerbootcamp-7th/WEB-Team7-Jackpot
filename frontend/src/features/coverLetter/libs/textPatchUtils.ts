import { mapCleanRangeToTaggedRange } from '@/shared/hooks/useReviewState/helpers';
import type { Review } from '@/shared/types/review';
import { buildTextPatch } from '@/shared/utils/textDiff';

interface CreateTextUpdatePayloadParams {
  oldText: string;
  newText: string;
  caretAfter: number;
  reviews: Review[];
  removeWholeReviewIds?: number[];
}

export interface TextUpdatePayload {
  startIdx: number;
  endIdx: number;
  replacedText: string;
}

export const createTextUpdatePayload = ({
  oldText,
  newText,
  caretAfter,
  reviews,
  removeWholeReviewIds,
}: CreateTextUpdatePayloadParams): TextUpdatePayload => {
  const patch = buildTextPatch(oldText, newText, { caretAfter });
  const insertionBias = (() => {
    if (patch.startIdx !== patch.endIdx) return undefined;
    const insertionIndex = patch.startIdx;
    let bias: 'before' | 'after' | undefined;
    for (const review of reviews) {
      if (review.range.start < 0 || review.range.end < 0) continue;
      if (insertionIndex === review.range.end) return 'after' as const;
      if (insertionIndex === review.range.start && !bias)
        bias = 'before' as const;
    }
    return bias;
  })();

  const taggedRange = mapCleanRangeToTaggedRange(
    oldText,
    reviews,
    {
      start: patch.startIdx,
      end: patch.endIdx,
    },
    {
      insertionBias,
      removeWholeReviewIds,
    },
  );

  return {
    startIdx: taggedRange.startIdx,
    endIdx: taggedRange.endIdx,
    replacedText: patch.replacedText,
  };
};
