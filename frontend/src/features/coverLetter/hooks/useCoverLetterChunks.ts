import { useEffect, useMemo, useState } from 'react';

import { buildChunks } from '@/features/coverLetter/libs/buildChunks';
import { useTextSelection } from '@/shared/hooks/useTextSelection';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

interface UseCoverLetterChunksParams {
  text: string;
  reviews: Review[];
  editingReview: Review | null;
  selection: SelectionInfo | null;
  selectedReviewId: number | null;
  isReviewActive: boolean;
  onSelectionChange: (selection: SelectionInfo | null) => void;
}

export const useCoverLetterChunks = ({
  text,
  reviews,
  editingReview,
  selection,
  selectedReviewId,
  isReviewActive,
  onSelectionChange,
}: UseCoverLetterChunksParams) => {
  const [spacerHeight, setSpacerHeight] = useState(0);

  const { containerRef, before, after } = useTextSelection({
    text,
    reviews,
    editingReview,
    selection,
    onSelectionChange,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const lineHeight = 28;
    const el = containerRef.current;
    const update = () => {
      setSpacerHeight(Math.max(0, el.clientHeight - lineHeight));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  const chunkPositions = useMemo(
    () =>
      before.reduce<number[]>((acc, _, i) => {
        if (i === 0) acc.push(0);
        else acc.push(acc[i - 1] + before[i - 1].text.length);
        return acc;
      }, []),
    [before],
  );

  const chunks = useMemo(
    () =>
      buildChunks(
        before,
        after,
        chunkPositions,
        reviews,
        selectedReviewId,
        isReviewActive,
        selection,
      ),
    [before, after, chunkPositions, reviews, selectedReviewId, isReviewActive, selection],
  );

  return { containerRef, chunks, spacerHeight };
};
