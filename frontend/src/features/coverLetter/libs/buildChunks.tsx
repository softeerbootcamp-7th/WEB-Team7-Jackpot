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
  const findMatchingReview = (pos: number, length: number) =>
    reviews.find(
      (review) =>
        review.range.start >= 0 &&
        review.range.start <= pos &&
        review.range.end >= pos + length,
    );

  const renderText = (text: string, keyPrefix: string, isDimmed = false) => {
    // trailing \n은 브라우저가 텍스트 노드 끝에서 시각적으로 무시한다.
    // \u200B를 뒤에 붙이면:
    //   1) \n 뒤에 내용이 생겨 줄바꿈이 시각적으로 표시됨 (다음 줄에 커서 이동)
    //   2) 커서가 \n과 \u200B 사이에 위치 → IME가 커서를 \n 앞으로 당기지 않음 (한글 조합 정상화)
    // collectText / restoreCaret은 이미 \u200B를 필터링·건너뜀 처리한다.
    // <br> 사용 시 Chrome이 contentEditable DOM을 재구조화해 React removeChild 에러가 발생하므로
    // <br> 대신 이 방식을 사용한다.
    const displayText = text.endsWith('\n') ? `${text}\u200B` : text;
    return (
      <span
        key={`${keyPrefix}-wrapper`}
        className={isDimmed ? 'opacity-30' : ''}
        data-chunk='true'
      >
        {displayText}
      </span>
    );
  };

  // 기존 before/after chunks 생성 로직
  const beforeChunks = before.flatMap((chunk, i) => {
    if (!chunk.text) return [];

    const key = `before-${i}`;
    if (!chunk.isHighlighted) return renderText(chunk.text, key);

    const matchingReview = findMatchingReview(
      chunkPositions[i],
      chunk.text.length,
    );

    if (!matchingReview) return renderText(chunk.text, key);

    const isSelected = selectedReviewId === matchingReview.id;
    const reviewClassName = [
      'outline-none',
      isReviewActive && 'cursor-pointer font-bold',
      isSelected && 'rounded-sm bg-red-100 ring-1 ring-red-200',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span
        key={`review-group-${matchingReview.id}-${i}`}
        data-chunk='true'
        data-review-group={matchingReview.id}
        contentEditable={false}
      >
        <span
          key={`review-wrap-${matchingReview.id}-${i}`}
          className={reviewClassName || undefined}
          data-review-id={matchingReview.id}
          data-chunk='true'
          contentEditable={true}
          suppressContentEditableWarning
        >
          {renderText(chunk.text, `review-content-${matchingReview.id}-${i}`)}
        </span>
        <span
          key={`review-boundary-${matchingReview.id}-${i}`}
          data-review-boundary='true'
          contentEditable={false}
          aria-hidden='true'
          className='pointer-events-none inline-block w-0 overflow-hidden select-none'
          data-chunk='true'
        >
          {'\u200B'}
        </span>
        <span
          key={`review-tail-${matchingReview.id}-${i}`}
          data-review-tail={matchingReview.id}
          contentEditable={false}
          aria-hidden='true'
          className='pointer-events-none select-none'
          data-chunk='true'
        >
          {'\u200B'}
        </span>
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
        data-chunk='true'
      />,
    );
    finalChunks.push(...afterChunksElements);
  }

  // 마지막 요소가 리뷰 그룹(contentEditable=false)인 경우, 그 뒤에 커서를 둘 수 없어서
  // 클릭 시 이전 리뷰가 선택되는 문제가 발생함.
  // 이를 해결하기 위해 맨 뒤에 항상 빈 텍스트 노드(ZWSP)를 포함한 span을 추가함.
  if (after.length === 0 && before.length > 0) {
    let lastIndex = before.length - 1;
    while (lastIndex >= 0 && !before[lastIndex].text) {
      lastIndex -= 1;
    }

    if (lastIndex >= 0) {
      const lastChunk = before[lastIndex];
      const lastPos = chunkPositions[lastIndex];

      const matchingReview = findMatchingReview(lastPos, lastChunk.text.length);

      if (matchingReview) {
        finalChunks.push(
          <span key={`before-${before.length}-wrapper`} data-chunk='true'>
            {'\u200B'}
          </span>,
        );
      }
    }
  }

  return finalChunks;
};
