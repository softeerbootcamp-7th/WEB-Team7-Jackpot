import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { buildChunks } from '@/features/coverLetter/libs/buildChunks';
import {
  collectText,
  getCaretPosition,
  restoreCaret,
} from '@/features/coverLetter/libs/caret';
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
  onComposingLengthChange?: (length: number | null) => void;
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
  onComposingLengthChange,
}: CoverLetterContentProps) => {
  const [spacerHeight, setSpacerHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInputtingRef = useRef(false);
  const caretOffsetRef = useRef(0);
  const isComposingRef = useRef(false);

  const latestTextRef = useRef(text);
  useEffect(() => {
    latestTextRef.current = text;
  }, [text]);

  const onTextChangeRef = useRef(onTextChange);
  useEffect(() => {
    onTextChangeRef.current = onTextChange;
  }, [onTextChange]);

  const onComposingLengthChangeRef = useRef(onComposingLengthChange);
  useEffect(() => {
    onComposingLengthChangeRef.current = onComposingLengthChange;
  }, [onComposingLengthChange]);

  const undoStack = useRef<{ text: string; caret: number }[]>([]);
  const redoStack = useRef<{ text: string; caret: number }[]>([]);

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

  // 텍스트 변경 + Undo 스택 관리 (ref 기반 — 항상 최신 값 사용)
  const updateText = useCallback((newText: string) => {
    if (!onTextChangeRef.current) return;

    const currentText = latestTextRef.current;
    if (newText !== currentText) {
      undoStack.current.push({
        text: currentText,
        caret: caretOffsetRef.current,
      });
      if (undoStack.current.length > 100) undoStack.current.shift();
      redoStack.current = [];
      isInputtingRef.current = true;
      latestTextRef.current = newText; // 즉시 동기 업데이트 — re-render 전 다음 입력에서도 최신 값 사용
      onTextChangeRef.current(newText);
    }
  }, []);

  // 일반 입력 처리
  const processInput = () => {
    if (!contentRef.current || isComposingRef.current) return;

    const newText = collectText(contentRef.current);

    if (newText === '') {
      caretOffsetRef.current = 0;
    } else {
      const { start } = getCaretPosition(contentRef.current);
      caretOffsetRef.current = start;
    }

    updateText(newText);
  };

  // compositionEnd 직후 등 DOM과 latestTextRef가 불일치할 수 있으므로 ref만 동기화.
  // undo 스택에 중간 상태를 남기지 않기 위해 updateText 대신 ref를 직접 갱신한다.
  const syncDOMToState = useCallback(() => {
    if (!contentRef.current) return;
    const domText = collectText(contentRef.current);
    if (domText !== latestTextRef.current) {
      latestTextRef.current = domText;
    }
  }, []);

  // 커서 위치에 텍스트 삽입 (ref 기반)
  const insertTextAtCaret = useCallback(
    (insertStr: string) => {
      if (!contentRef.current) return;

      syncDOMToState();

      const { start, end } = getCaretPosition(contentRef.current);

      const currentText = latestTextRef.current;
      const newText =
        currentText.slice(0, start) + insertStr + currentText.slice(end);
      caretOffsetRef.current = start + insertStr.length;

      updateText(newText);
    },
    [syncDOMToState, updateText],
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
  }, [text]);

  const handleInput = () => {
    // 조합 중에는 텍스트 상태를 갱신하지 않지만 글자 수만 실시간 반영
    if (isComposingRef.current) {
      if (contentRef.current) {
        onComposingLengthChangeRef.current?.(
          collectText(contentRef.current).length,
        );
      }
      return;
    }
    processInput();
  };
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };
  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    onComposingLengthChangeRef.current?.(null);
    // compositionEnd 시점에 이전 조합은 확정된 상태.
    // 동기적으로 DOM 텍스트를 읽어 상태를 갱신한다.
    // rAF로 지연하면 다음 compositionStart가 먼저 도착해 isComposing이 다시 true가 되어 스킵될 수 있다.
    if (!contentRef.current) return;
    const domText = collectText(contentRef.current);
    if (domText !== latestTextRef.current) {
      const { start } = getCaretPosition(contentRef.current);
      caretOffsetRef.current = domText === '' ? 0 : start;
      updateText(domText);
    }
  };

  // Undo/Redo (ref 기반)
  useEffect(() => {
    const performUndo = () => {
      if (undoStack.current.length === 0) return;
      const prev = undoStack.current.pop()!;
      const currentText = latestTextRef.current;
      redoStack.current.push({
        text: currentText,
        caret: caretOffsetRef.current,
      });
      caretOffsetRef.current = prev.caret;
      isInputtingRef.current = true;
      latestTextRef.current = prev.text;
      onTextChangeRef.current?.(prev.text);
    };

    const performRedo = () => {
      if (redoStack.current.length === 0) return;
      const next = redoStack.current.pop()!;
      const currentText = latestTextRef.current;
      undoStack.current.push({
        text: currentText,
        caret: caretOffsetRef.current,
      });
      caretOffsetRef.current = next.caret;
      isInputtingRef.current = true;
      latestTextRef.current = next.text;
      onTextChangeRef.current?.(next.text);
    };

    const handleKey = (e: KeyboardEvent) => {
      // 현재 contentEditable에 포커스가 있을 때만 동작
      if (!contentRef.current?.contains(document.activeElement)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) performRedo();
        else performUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        performRedo();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Backspace / Delete / Enter 처리 (ref 기반)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposingRef.current || e.nativeEvent.isComposing) return;

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      if (!contentRef.current) return;

      syncDOMToState();

      const { start, end } = getCaretPosition(contentRef.current);

      const currentText = latestTextRef.current;
      let newText = currentText;

      if (start !== end) {
        newText = currentText.slice(0, start) + currentText.slice(end);
        caretOffsetRef.current = start;
      } else {
        if (e.key === 'Backspace' && start > 0) {
          newText = currentText.slice(0, start - 1) + currentText.slice(end);
          caretOffsetRef.current = start - 1;
        } else if (e.key === 'Delete' && start < currentText.length) {
          newText = currentText.slice(0, start) + currentText.slice(end + 1);
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
