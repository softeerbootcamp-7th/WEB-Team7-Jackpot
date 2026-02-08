import { useEffect, useRef, useState } from 'react';

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
  onTextChange?: (newText: string) => void;
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
  onTextChange,
}: CoverLetterContentProps) => {
  const { containerRef, handleMouseUp, before, after } = useTextSelection({
    text,
    reviews,
    editingReview,
    selection,
    onSelectionChange,
  });
  const [bottomPadding, setBottomPadding] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const updatePadding = () => {
      const containerHeight = container.clientHeight;
      const computedStyle = window.getComputedStyle(container);
      const lineHeight = parseFloat(computedStyle.lineHeight) || 28;
      setBottomPadding(Math.max(0, containerHeight - lineHeight));
    };

    updatePadding();

    const resizeObserver = new ResizeObserver(updatePadding);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [text, containerRef]);

  const chunkPositions = before.reduce<number[]>((acc, _, i) => {
    if (i === 0) {
      acc.push(0);
    } else {
      acc.push(acc[i - 1] + before[i - 1].text.length);
    }
    return acc;
  }, []);

  // HTML 문자열 생성
  const renderHTML = () => {
    const beforeHTML = before
      .map((chunk: TextChunk, i: number) => {
        if (!chunk.isHighlighted) {
          return chunk.text;
        }

        const chunkStart = chunkPositions[i];
        const chunkEnd = chunkStart + chunk.text.length;

        const matchingReview = reviews.find((review) => {
          if (!review.isValid) return false;
          return (
            review.range.start <= chunkStart && review.range.end >= chunkEnd
          );
        });

        if (!matchingReview) {
          return chunk.text;
        }

        const isSelected = selectedReviewId === matchingReview.id;
        const className = `${isReviewOpen ? 'cursor-pointer font-bold' : ''} ${
          isSelected ? 'bg-red-100' : ''
        }`;

        return `<span class="${className}" data-review-id="${matchingReview.id}">${chunk.text}</span>`;
      })
      .join('');

    let afterHTML = '';
    if (selection && after.length > 0) {
      const afterChunks = after
        .map(
          (chunk: TextChunk) =>
            `<span class="${chunk.isHighlighted ? 'font-bold' : ''}">${chunk.text}</span>`,
        )
        .join('');
      afterHTML = `<div class="h-2.5"></div><span class="opacity-30">${afterChunks}</span>`;
    }

    return beforeHTML + afterHTML;
  };

  // 편집 이벤트 처리
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || '';
    onTextChange?.(newText);
  };

  // 리뷰 클릭 이벤트 처리
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const reviewId = target.getAttribute('data-review-id');
    if (reviewId && isReviewOpen) {
      onReviewClick(reviewId);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className='relative ml-12 min-h-0 w-full flex-1 px-4'
      style={{
        whiteSpace: 'pre-wrap',
        overflowY: selection ? 'hidden' : 'auto',
      }}
    >
      <div
        ref={contentRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onClick={handleClick}
        className='w-full py-2 text-base leading-7 font-normal text-gray-800 outline-none'
        style={{
          paddingBottom: bottomPadding,
        }}
        dangerouslySetInnerHTML={{ __html: renderHTML() }}
      />
    </div>
  );
};

export default CoverLetterContent;
