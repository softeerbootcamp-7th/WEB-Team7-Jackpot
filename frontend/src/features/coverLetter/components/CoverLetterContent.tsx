// features/coverLetter/components/CoverLetterContent.tsx
import { useEffect, useState } from 'react';

import type { Review } from '@/features/review/types/review';
import type { SelectionInfo } from '@/features/review/types/selectionInfo';
import { useTextSelection } from '@/shared/hooks/useTextSelection';
import type { TextChunk } from '@/shared/hooks/useTextSelection/helpers';

interface CoverLetterContentProps {
  text: string;
  reviews: Review[];
  editingReview: Review | null;
  selection: SelectionInfo | null;
  isReviewOpen: boolean;
  selectedReviewId: string | null;
  onSelectionChange: (selection: SelectionInfo | null) => void;
  onReviewClick: (reviewId: string) => void;
}

const CoverLetterContent = ({
  text,
  reviews,
  editingReview,
  selection,
  isReviewOpen,
  selectedReviewId,
  onSelectionChange,
  onReviewClick,
}: CoverLetterContentProps) => {
  const { containerRef, handleMouseUp, before, after } = useTextSelection({
    text,
    reviews,
    editingReview,
    selection,
    onSelectionChange,
  });
  const [bottomPadding, setBottomPadding] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const updatePadding = () => {
      const containerHeight = container.clientHeight;
      const computedStyle = window.getComputedStyle(container);
      const lineHeight = parseFloat(computedStyle.lineHeight) || 28;
      setBottomPadding(containerHeight - lineHeight);
    };

    updatePadding();

    const resizeObserver = new ResizeObserver(updatePadding);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [text, containerRef]);

  return (
    <div
      contentEditable={true}
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className='relative ml-12 min-h-0 w-full flex-1 px-4 outline-none'
      style={{
        whiteSpace: 'pre-wrap',
        overflowY: selection ? 'hidden' : 'auto',
      }}
    >
      <div
        className='w-full py-2 text-base leading-7 font-normal text-gray-800'
        style={{
          paddingBottom: bottomPadding,
        }}
      >
        {before.map((chunk: TextChunk, i: number) => {
          if (!chunk.isHighlighted) {
            return <span key={i}>{chunk.text}</span>;
          }

          const chunkStart = before
            .slice(0, i)
            .reduce((sum: number, c: TextChunk) => sum + c.text.length, 0);
          const chunkEnd = chunkStart + chunk.text.length;

          const matchingReview = reviews.find((review) => {
            if (!review.isValid) return false;
            return (
              review.range.start <= chunkStart && review.range.end >= chunkEnd
            );
          });

          if (!matchingReview) {
            return <span key={i}>{chunk.text}</span>;
          }

          const isSelected = selectedReviewId === matchingReview.id;

          return (
            <span
              key={i}
              onClick={
                isReviewOpen
                  ? () => onReviewClick(matchingReview.id)
                  : undefined
              }
              className={`${isReviewOpen ? 'cursor-pointer font-bold' : ''} ${
                isSelected ? 'bg-red-100' : ''
              }`}
            >
              {chunk.text}
            </span>
          );
        })}

        {selection && after.length > 0 && (
          <>
            <div className='h-2.5' />
            <span className='opacity-30'>
              {after.map((chunk: TextChunk, i: number) => (
                <span
                  key={`after-${i}`}
                  className={chunk.isHighlighted ? 'font-bold' : ''}
                >
                  {chunk.text}
                </span>
              ))}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default CoverLetterContent;
