import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { buildChunks } from '@/features/coverLetter/libs/buildChunks';
import { restoreCaret } from '@/features/coverLetter/libs/caret';
import { useTextSelection } from '@/shared/hooks/useTextSelection';
import { rangeToTextIndices } from '@/shared/hooks/useTextSelection/helpers';
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

  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

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

  // === 텍스트 변경 + Undo 스택 관리 ===
  const updateText = useCallback(
    (newText: string) => {
      if (!onTextChange) return;

      // 이전 상태 undo stack에 저장
      if (newText !== text) {
        undoStack.current.push(text);
        if (undoStack.current.length > 100) undoStack.current.shift();
        redoStack.current = []; // 새 입력 → redo 초기화
        isInputtingRef.current = true;
        onTextChange(newText);
      }
    },
    [text, onTextChange],
  );

  // 일반 입력 처리
  const processInput = () => {
    if (!contentRef.current || isComposingRef.current) return;

    const rawText =
      contentRef.current.textContent?.replace(/\u200B/g, '') || '';
    const newText = rawText;

    if (newText === '') {
      if (contentRef.current.childNodes.length === 0) {
        contentRef.current.appendChild(document.createTextNode(''));
      }
      caretOffsetRef.current = 0;
    } else {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const { start } = rangeToTextIndices(contentRef.current, range);
        caretOffsetRef.current = start;
      }
    }

    updateText(newText);
  };

  // 커서 위치에 텍스트 삽입
  const insertTextAtCaret = useCallback(
    (insertStr: string) => {
      if (!contentRef.current) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      const { start, end } = rangeToTextIndices(contentRef.current, range);

      const newText = text.slice(0, start) + insertStr + text.slice(end);
      caretOffsetRef.current = start + insertStr.length;

      updateText(newText);
    },
    [text, updateText], // 이제 경고 없어짐
  );

  // caret 복원
  useLayoutEffect(() => {
    if (
      !contentRef.current ||
      !isInputtingRef.current ||
      isComposingRef.current
    )
      return;

    if (text === '') {
      const firstSpan = contentRef.current.querySelector('span');
      if (firstSpan) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(firstSpan.firstChild || firstSpan, 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    } else {
      restoreCaret(contentRef.current, caretOffsetRef.current);
    }

    isInputtingRef.current = false;
  }, [chunks, text]);

  const handleInput = () => processInput();
  const handleCompositionStart = () => (isComposingRef.current = true);
  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    processInput();
  };

  // === Undo/Redo ===
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          // redo
          if (redoStack.current.length === 0) return;
          const nextText = redoStack.current.pop()!;
          undoStack.current.push(text);
          caretOffsetRef.current = nextText.length;
          isInputtingRef.current = true;
          onTextChange?.(nextText);
        } else {
          // undo
          if (undoStack.current.length === 0) return;
          const prevText = undoStack.current.pop()!;
          redoStack.current.push(text);
          caretOffsetRef.current = prevText.length;
          isInputtingRef.current = true;
          onTextChange?.(prevText);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        // redo
        if (redoStack.current.length === 0) return;
        const nextText = redoStack.current.pop()!;
        undoStack.current.push(text);
        caretOffsetRef.current = nextText.length;
        isInputtingRef.current = true;
        onTextChange?.(nextText);
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [text, onTextChange]);

  // 핵심: Backspace / Delete 안전 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      if (!contentRef.current) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      const { start, end } = rangeToTextIndices(contentRef.current, range);

      let newText = text;

      if (start !== end) {
        newText = text.slice(0, start) + text.slice(end);
        caretOffsetRef.current = start;
      } else {
        if (e.key === 'Backspace' && start > 0) {
          newText = text.slice(0, start - 1) + text.slice(end);
          caretOffsetRef.current = start - 1;
        } else if (e.key === 'Delete' && start < text.length) {
          newText = text.slice(0, start) + text.slice(end + 1);
          caretOffsetRef.current = start;
        }
      }

      if (newText === '') caretOffsetRef.current = 0;

      updateText(newText);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      insertTextAtCaret('\n');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plainText = e.clipboardData.getData('text/plain');
    insertTextAtCaret(plainText);
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
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onClick={handleClick}
          className='w-full cursor-text py-3 text-base leading-7 font-normal text-gray-800 outline-none'
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            paddingBottom: spacerHeight,
          }}
        >
          {chunks.length > 0 ? chunks : <span>&#8203;</span>}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterContent;
