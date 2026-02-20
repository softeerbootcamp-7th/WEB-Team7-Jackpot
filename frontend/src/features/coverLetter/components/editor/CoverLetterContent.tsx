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
import type { TextChangeResult } from '@/features/coverLetter/types/coverLetter';
import { useTextSelection } from '@/shared/hooks/useTextSelection';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';
import type { WriterMessageType } from '@/shared/types/websocket';

interface CoverLetterContentProps {
  text: string;
  reviews: Review[];
  editingReview: Review | null;
  selection: SelectionInfo | null;
  isReviewActive: boolean;
  selectedReviewId: number | null;
  onSelectionChange: (selection: SelectionInfo | null) => void;
  onReviewClick: (reviewId: number) => void;
  onTextChange?: (
    newText: string,
    options?: { skipVersionIncrement?: boolean },
  ) => TextChangeResult | void;
  onReserveNextVersion?: () => number;
  onComposingLengthChange?: (length: number | null) => void;
  isConnected: boolean;
  sendMessage: (destination: string, body: unknown) => void;
  shareId: string;
  qnAId: string;
  initialVersion: number;
  replaceAllSignal: number;
  onTextUpdateSent?: (at: string) => void;
}

const CoverLetterContent = ({
  text,
  reviews,
  editingReview,
  selection,
  isReviewActive,
  selectedReviewId,
  onSelectionChange,
  onReviewClick,
  onTextChange,
  onReserveNextVersion,
  onComposingLengthChange,
  isConnected,
  sendMessage,
  shareId,
  qnAId,
  initialVersion,
  replaceAllSignal,
  onTextUpdateSent,
}: CoverLetterContentProps) => {
  const [spacerHeight, setSpacerHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInputtingRef = useRef(false);
  const caretOffsetRef = useRef(0);
  const isComposingRef = useRef(false);
  const composingLastSentTextRef = useRef<string | null>(null);
  const composingFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const { containerRef, before, after } = useTextSelection({
    text,
    reviews,
    editingReview,
    selection,
    onSelectionChange,
  });

  const fallbackVersionRef = useRef(initialVersion);
  const lastSeenVersionRef = useRef(initialVersion);
  const latestTextRef = useRef(text);
  const onComposingLengthChangeRef = useRef(onComposingLengthChange);
  const getFocusedCaretOffset = useCallback(() => {
    if (!contentRef.current) return caretOffsetRef.current;
    if (!contentRef.current.contains(document.activeElement)) {
      return caretOffsetRef.current;
    }
    const { start } = getCaretPosition(contentRef.current);
    return Number.isFinite(start) ? start : caretOffsetRef.current;
  }, []);

  // qnAId가 바뀌거나 처음 로드될 때 API 초기 버전으로 ref 동기화
  useEffect(() => {
    const versionChanged = initialVersion !== lastSeenVersionRef.current;
    lastSeenVersionRef.current = initialVersion;
    fallbackVersionRef.current = initialVersion;

    if (!versionChanged) return;

    // TEXT_REPLACE_ALL이 같은 텍스트를 내려도 version은 바뀔 수 있다.
    // version 변경 시 조합 상태만 정리하고, 포커스/커서 복원은 replaceAllSignal 경로에서만 처리한다.
    const wasComposing = isComposingRef.current;
    if (wasComposing) {
      isComposingRef.current = false;
      if (composingFlushTimerRef.current) {
        clearTimeout(composingFlushTimerRef.current);
        composingFlushTimerRef.current = null;
      }
      onComposingLengthChangeRef.current?.(null);
    }
  }, [initialVersion, qnAId]);
  useEffect(() => {
    onComposingLengthChangeRef.current = onComposingLengthChange;
  }, [onComposingLengthChange]);
  useEffect(() => {
    const hasExternalTextUpdate = text !== latestTextRef.current;

    if (hasExternalTextUpdate && isComposingRef.current) {
      isComposingRef.current = false;
      if (composingFlushTimerRef.current) {
        clearTimeout(composingFlushTimerRef.current);
        composingFlushTimerRef.current = null;
      }
      onComposingLengthChangeRef.current?.(null);
    }

    latestTextRef.current = text;
  }, [text, qnAId]);
  const onTextChangeRef = useRef(onTextChange);
  useEffect(() => {
    onTextChangeRef.current = onTextChange;
  }, [onTextChange]);

  const undoStack = useRef<{ text: string; caret: number }[]>([]);
  const redoStack = useRef<{ text: string; caret: number }[]>([]);

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
        isReviewActive,
        selection,
      ),
    [
      before,
      after,
      chunkPositions,
      reviews,
      selectedReviewId,
      isReviewActive,
      selection,
    ],
  );

  // 텍스트 변경 + Undo 스택 관리 (ref 기반 — 항상 최신 값 사용)
  const buildPatch = useCallback((oldText: string, newText: string) => {
    let startIdx = 0;
    while (
      startIdx < oldText.length &&
      startIdx < newText.length &&
      oldText[startIdx] === newText[startIdx]
    ) {
      startIdx++;
    }

    let suffixLen = 0;
    while (
      suffixLen < oldText.length - startIdx &&
      suffixLen < newText.length - startIdx &&
      oldText[oldText.length - 1 - suffixLen] ===
        newText[newText.length - 1 - suffixLen]
    ) {
      suffixLen++;
    }

    return {
      startIdx,
      endIdx: oldText.length - suffixLen,
      replacedText: newText.slice(startIdx, newText.length - suffixLen),
    };
  }, []);

  const sendTextPatch = useCallback(
    (oldText: string, newText: string) => {
      if (!isConnected || !shareId || !qnAId) return false;
      if (oldText === newText) return false;

      const patch = buildPatch(oldText, newText);
      const nextVersion = onReserveNextVersion
        ? onReserveNextVersion()
        : (fallbackVersionRef.current += 1);
      sendMessage(`/pub/share/${shareId}/qna/${qnAId}/text-update`, {
        version: nextVersion,
        startIdx: patch.startIdx,
        endIdx: patch.endIdx,
        replacedText: patch.replacedText,
      } as WriterMessageType);
      onTextUpdateSent?.(new Date().toISOString());
      return true;
    },
    [
      buildPatch,
      isConnected,
      onReserveNextVersion,
      onTextUpdateSent,
      qnAId,
      sendMessage,
      shareId,
    ],
  );

  const updateText = useCallback(
    (newText: string, options?: { skipSocket?: boolean }) => {
      if (!onTextChangeRef.current) return;

      const currentText = latestTextRef.current;
      if (newText !== currentText) {
          const sentBySocket = !options?.skipSocket
            ? sendTextPatch(currentText, newText)
            : false;
          const change = onTextChangeRef.current(newText, {
            skipVersionIncrement: sentBySocket,
          });
          if (change && typeof change === 'object') {
          undoStack.current.push({
            text: currentText,
            caret: caretOffsetRef.current,
          });

          if (undoStack.current.length > 100) undoStack.current.shift();
          redoStack.current = [];
          isInputtingRef.current = true;
          latestTextRef.current = newText; // 즉시 동기 업데이트 — re-render 전 다음 입력에서도 최신 값 사용

        }
      }
    },
    [sendTextPatch],
  );

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

  const clearComposingFlushTimer = useCallback(() => {
    if (!composingFlushTimerRef.current) return;
    clearTimeout(composingFlushTimerRef.current);
    composingFlushTimerRef.current = null;
  }, []);

  const flushDOMText = useCallback(
    (options?: { skipSocket?: boolean }) => {
      if (!contentRef.current) return;
      const domText = collectText(contentRef.current);
      if (domText === latestTextRef.current) return;
      const { start } = getCaretPosition(contentRef.current);
      caretOffsetRef.current = domText === '' ? 0 : start;
      updateText(domText, { skipSocket: options?.skipSocket });
    },
    [updateText],
  );

  const flushComposingSocketOnly = useCallback(() => {
    if (!contentRef.current) return;
    const domText = collectText(contentRef.current);
    const baseText = composingLastSentTextRef.current ?? latestTextRef.current;
    if (domText === baseText) return;
    sendTextPatch(baseText, domText);
    composingLastSentTextRef.current = domText;
  }, [sendTextPatch]);

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
    const el = contentRef.current;
    const isFocused = Boolean(el?.contains(document.activeElement));

    if (!contentRef.current) return;
    if (!isInputtingRef.current && !isFocused) return;

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
      const boundedOffset = Math.min(caretOffsetRef.current, text.length);
      restoreCaret(contentRef.current, boundedOffset);
    }

    isInputtingRef.current = false;
  }, [text, qnAId]);

  const handleInput = () => {
    // 조합 중에는 텍스트 상태를 갱신하지 않지만 글자 수만 실시간 반영
    if (isComposingRef.current) {
      if (contentRef.current) {
        onComposingLengthChangeRef.current?.(
          collectText(contentRef.current).length,
        );
      }
      clearComposingFlushTimer();
      composingFlushTimerRef.current = setTimeout(() => {
        flushComposingSocketOnly();
        // 조합 중에도 로컬 상태를 주기적으로 동기화해,
        // 외부 리렌더 시 조합 문자가 사라지는 현상을 막는다.
        flushDOMText({ skipSocket: true });
      }, 250);
      return;
    }
    processInput();
  };
  const handleCompositionStart = () => {
    clearComposingFlushTimer();
    composingLastSentTextRef.current = latestTextRef.current;
    isComposingRef.current = true;
  };
  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    clearComposingFlushTimer();
    flushComposingSocketOnly();
    onComposingLengthChangeRef.current?.(null);
    flushDOMText({ skipSocket: true });
    composingLastSentTextRef.current = null;
  };

  useEffect(
    () => () => {
      clearComposingFlushTimer();
    },
    [clearComposingFlushTimer],
  );

  useLayoutEffect(() => {
    if (!contentRef.current) return;

    const wasFocused = contentRef.current.contains(document.activeElement);
    if (wasFocused) {
      caretOffsetRef.current = getFocusedCaretOffset();
    }
    const boundedOffset = Math.min(caretOffsetRef.current, text.length);

    isComposingRef.current = false;
    composingLastSentTextRef.current = null;
    clearComposingFlushTimer();
    onComposingLengthChangeRef.current?.(null);
    latestTextRef.current = text;

    if (wasFocused) {
      contentRef.current.blur();
      window.requestAnimationFrame(() => {
        if (!contentRef.current) return;
        contentRef.current.focus();
        restoreCaret(contentRef.current, boundedOffset);
      });
    }
  }, [replaceAllSignal, text, clearComposingFlushTimer, getFocusedCaretOffset]);

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
    if (reviewIdStr && isReviewActive) {
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
