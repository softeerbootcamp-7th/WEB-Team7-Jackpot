import React from 'react';

import type { TextChunk } from '@/shared/hooks/useTextSelection/helpers';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

export const buildChunks = (
  before: TextChunk[],
  after: TextChunk[],
  chunkPositions: number[],
  reviews: Review[],
  selectedReviewId: number | null,
  isReviewActive: boolean,
  selection: SelectionInfo | null,
) => {
  const renderText = (text: string, keyPrefix: string, isDimmed = false) => {
    const lines = text.split('\n');
    return (
      <span
        key={`${keyPrefix}-wrapper`}
        className={isDimmed ? 'opacity-30' : ''}
      >
        {lines.map((line, i) => (
          <React.Fragment key={`line-${i}`}>
            {line === '' ? <span>&#8203;</span> : line}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // 기존 before/after chunks 생성 로직
  const beforeChunks = before.flatMap((chunk, i) => {
    if (!chunk.text) return [];

    const key = `before-${i}`;
    if (!chunk.isHighlighted) return renderText(chunk.text, key);

    const matchingReview = reviews.find(
      (review) =>
        (review.viewStatus === 'PENDING' || review.viewStatus === 'ACCEPTED') &&
        review.range.start >= 0 &&
        review.range.start <= chunkPositions[i] &&
        review.range.end >= chunkPositions[i] + chunk.text.length,
    );
    if (!matchingReview) return renderText(chunk.text, key);

    const isSelected = selectedReviewId === matchingReview.id;
    const reviewClassName = [
      isReviewActive && 'cursor-pointer font-bold',
      isSelected && 'rounded-sm bg-red-100 ring-1 ring-red-200',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span
        key={`review-wrap-${matchingReview.id}-${i}`}
        className={reviewClassName}
        data-review-id={matchingReview.id}
      >
        {renderText(chunk.text, `review-content-${matchingReview.id}-${i}`)}
      </span>
    );
  });

  const afterChunksElements = after.flatMap((chunk, i) =>
    renderText(chunk.text, `after-${i}`, !!selection),
  );

  const finalChunks: React.ReactNode[] = [...beforeChunks];
  if (selection && afterChunksElements.length > 0) {
    finalChunks.push(
      <span
        key='selection-spacer'
        className='block h-12 w-full'
        contentEditable={false}
      />,
    );
    finalChunks.push(...afterChunksElements);
  }

  return finalChunks;
};
