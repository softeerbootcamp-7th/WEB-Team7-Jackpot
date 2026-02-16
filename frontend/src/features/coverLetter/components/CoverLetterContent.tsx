import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { buildChunks } from '@/features/coverLetter/libs/buildChunks';
import { restoreCaret, saveCaret } from '@/features/coverLetter/libs/caret';
import { useTextSelection } from '@/shared/hooks/useTextSelection';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

interface CoverLetterContentProps {
  text: string;
  reviews: Review[];
  editingReview: Review | null;
  selection: SelectionInfo | null;
  isReviewOpen: boolean;
  selectedReviewId: number | null;
  onSelectionChange: (selection: SelectionInfo | null) => void;
  onReviewClick: (reviewId: number) => void;
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
  const [spacerHeight, setSpacerHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInputtingRef = useRef(false);
  const caretOffsetRef = useRef(0);
  const isComposingRef = useRef(false);

  const { containerRef, before, after } = useTextSelection({
    text,
    reviews,
    editingReview,
    selection,
    onSelectionChange,
  });

  // 컨테이너 높이에 따라 스페이서 설정
  useEffect(() => {
    if (!containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight;
    const lineHeight = 28;
    setSpacerHeight(Math.max(0, containerHeight - lineHeight));
  }, [containerRef]);

  // chunkPositions 계산
  const chunkPositions = useMemo(
    () =>
      before.reduce<number[]>((acc, _, i) => {
        if (i === 0) acc.push(0);
        else acc.push(acc[i - 1] + before[i - 1].text.length);
        return acc;
      }, []),
    [before],
  );

  // JSX chunks 생성
  const chunks = useMemo(
    () =>
      buildChunks(
        before,
        after,
        chunkPositions,
        reviews,
        selectedReviewId,
        isReviewOpen,
        selection,
      ),
    [
      before,
      after,
      chunkPositions,
      reviews,
      selectedReviewId,
      isReviewOpen,
      selection,
    ],
  );

  // caret 복원: layout effect로 렌더 후 바로 실행
  useLayoutEffect(() => {
    if (
      !contentRef.current ||
      !isInputtingRef.current ||
      isComposingRef.current
    )
      return;
    restoreCaret(contentRef.current, caretOffsetRef.current);
    isInputtingRef.current = false;
  }, [chunks]);

  // 입력 처리
  const processInput = () => {
    if (!contentRef.current || isComposingRef.current) return;
    const newText = contentRef.current.textContent || '';
    caretOffsetRef.current = saveCaret(contentRef.current);
    if (onTextChange) {
      isInputtingRef.current = true;
      onTextChange(newText);
    }
  };

  const handleInput = () => {
    processInput();
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    processInput();
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const reviewIdStr = target.getAttribute('data-review-id');
    if (reviewIdStr && isReviewOpen) {
      const reviewId = Number(reviewIdStr);
      if (!isNaN(reviewId)) onReviewClick(reviewId);
    }
  };

  return (
    <div className='relative ml-12 min-h-0 flex-1'>
      <div
        ref={containerRef}
        className='absolute inset-0 overflow-y-auto rounded-xl border border-gray-200 bg-white px-4 transition-colors focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 hover:border-gray-300'
        style={{
          whiteSpace: 'pre-wrap',
          overflowY: selection ? 'hidden' : 'auto',
        }}
      >
        <div
          ref={contentRef}
          contentEditable
          role='textbox'
          aria-multiline='true'
          aria-label='자기소개서 내용'
          suppressContentEditableWarning={true}
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onClick={handleClick}
          className='w-full cursor-text py-3 text-base leading-7 font-normal text-gray-800 outline-none'
          style={{ paddingBottom: spacerHeight }}
        >
          {chunks.length > 0 ? chunks : '\u200B'}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterContent;
