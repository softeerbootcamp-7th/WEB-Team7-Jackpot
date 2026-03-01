import {
  type FormEvent,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { useCoverLetterChunks } from '@/features/coverLetter/hooks/useCoverLetterChunks';
import { useCoverLetterCompositionFlow } from '@/features/coverLetter/hooks/useCoverLetterCompositionFlow';
import { useCoverLetterDeleteFlow } from '@/features/coverLetter/hooks/useCoverLetterDeleteFlow';
import { useCoverLetterInputHandlers } from '@/features/coverLetter/hooks/useCoverLetterInputHandlers';
import { useSendTextPatch } from '@/features/coverLetter/hooks/useSendTextPatch';
import {
  cleanupNonChunkNodes,
  collectText,
  getCaretPosition,
  restoreCaret,
} from '@/features/coverLetter/libs/caret';
import {
  findClickedReviewId,
  normalizeCaretAtReviewBoundary as normalizeCaretUtil,
} from '@/features/coverLetter/libs/caretBoundary';
import { reconcileReviewTrackingState } from '@/features/coverLetter/libs/reviewTracking';
import { bindUndoRedoShortcuts } from '@/features/coverLetter/libs/undoRedo';
import type { TextChangeResult } from '@/features/coverLetter/types/coverLetter';
import {
  calculateTextChange,
  updateReviewRanges,
} from '@/shared/hooks/useReviewState/helpers';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

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
  isConnected: boolean;
  sendMessage: (destination: string, body: unknown) => void;
  shareId: string;
  qnAId: string;
  currentVersion: number;
  replaceAllSignal: number;
  onTextUpdateSent?: (at: string) => void;
  onDeleteReviewsByText?: (reviewIds: number[]) => void;
  onComposingLengthChange?: (len: number | null) => void;
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
  isConnected,
  sendMessage,
  shareId,
  qnAId,
  currentVersion,
  replaceAllSignal,
  onTextUpdateSent,
  onDeleteReviewsByText,
  onComposingLengthChange,
}: CoverLetterContentProps) => {
  // 현재 contentEditable DOM 요소
  const contentRef = useRef<HTMLDivElement>(null);

  // 현재 커서 위치를 기록
  const caretOffsetRef = useRef(0);

  // 실제 DOM/State 업데이트 상태
  const isInputtingRef = useRef(false);

  // IME 조합 상태
  const isComposingRef = useRef(false);

  // IME 종료 시점 타이머
  const lastCompositionEndAtRef = useRef(0);

  // Enter 눌렀음 플래그
  const enterDuringCompositionRef = useRef(false);

  // TEXT_REPLACE_ALL 이벤트 처리 중임을 나타내는 플래그
  const isProcessingReplaceAllRef = useRef(false);
  const prevReplaceAllSignalRef = useRef(replaceAllSignal);

  // composition 중 TEXT_REPLACE_ALL이 도착했을 때 재적용하기 위해 저장
  const composingDOMTextRef = useRef<string | null>(null);
  const composingDOMCaretRef = useRef<number | null>(null);

  // 현재 커버레터 DOM과 React 상태를 기준으로 한 최신 텍스트를 저장하는 ref
  const latestTextRef = useRef(text);

  // 현재 커버레터에 적용된 모든 Review 객체들의 최신 상태를 저장하는 ref
  const reviewsRef = useRef(reviews);

  // 각 리뷰의 "마지막으로 알려진 텍스트 범위(start, end)"를 저장하는 ref
  const reviewLastKnownRangesRef = useRef<
    Record<number, { start: number; end: number }>
  >({});

  // 첨삭 리뷰(Review)의 범위를 "추적하고 동기화"하는 역할
  useEffect(() => {
    reviewsRef.current = reviews;
    const { nextLastKnownRanges } = reconcileReviewTrackingState({
      reviews,
      prevLastKnownRanges: reviewLastKnownRangesRef.current,
    });
    reviewLastKnownRangesRef.current = nextLastKnownRanges;
  }, [reviews]);

  // qnAId가 바뀌거나 처음 로드될 때 조합 상태를 항상 정리
  useEffect(() => {
    isComposingRef.current = false;
  }, [currentVersion, qnAId]);

  // 외부에서 text가 업데이트될 때 IME(한글 조합) 상태를 관리
  useEffect(() => {
    const hasExternalTextUpdate = text !== latestTextRef.current;
    if (hasExternalTextUpdate && isComposingRef.current) {
      isComposingRef.current = false;
    }
    latestTextRef.current = text;
  }, [text, qnAId]);

  const onTextChangeRef = useRef(onTextChange);
  useEffect(() => {
    onTextChangeRef.current = onTextChange;
  }, [onTextChange]);

  const undoStack = useRef<{ text: string; caret: number }[]>([]);
  const redoStack = useRef<{ text: string; caret: number }[]>([]);

  // WebSocket 디바운스 전송 로직
  const { sendTextPatch, sendTextPatchRef } = useSendTextPatch({
    isConnected,
    shareId,
    qnAId,
    onReserveNextVersion,
    sendMessage,
    onTextUpdateSent,
    caretOffsetRef,
    latestTextRef,
    reviewsRef,
  });

  const handleSelectionChange = useCallback(
    (newSelection: SelectionInfo | null) => {
      if (isComposingRef.current || isProcessingReplaceAllRef.current) return;
      onSelectionChange(newSelection);
    },
    [onSelectionChange],
  );

  const updateText = useCallback(
    (
      newText: string,
      options?: {
        skipSocket?: boolean;
        skipVersionIncrement?: boolean;
        reviewsForMapping?: Review[];
        removeWholeReviewIds?: number[];
        forceParentSync?: boolean;
        forceSocket?: boolean;
      },
    ) => {
      const handleTextChange = onTextChangeRef.current;
      if (!handleTextChange) return;

      const currentText = latestTextRef.current;
      const hasChanged = newText !== currentText;

      if (hasChanged || options?.forceParentSync) {
        const change = calculateTextChange(currentText, newText);
        const sentBySocket =
          !options?.skipSocket &&
          hasChanged &&
          (!isComposingRef.current || options?.forceSocket)
            ? sendTextPatch(currentText, newText, options?.reviewsForMapping, {
                force: options?.forceSocket,
              })
            : false;

        if (!isComposingRef.current || options?.forceParentSync) {
          handleTextChange(newText, {
            skipVersionIncrement: options?.skipVersionIncrement ?? sentBySocket,
          });
        }

        if (hasChanged) {
          const reviewsForNextMapping =
            options?.reviewsForMapping ?? reviewsRef.current;
          let nextReviews = updateReviewRanges(
            reviewsForNextMapping,
            change.changeStart,
            change.oldLength,
            change.newLength,
            newText,
          );
          if (options?.removeWholeReviewIds?.length) {
            nextReviews = nextReviews.filter(
              (r) => !options.removeWholeReviewIds!.includes(r.id),
            );
          }
          reviewsRef.current = nextReviews;
          undoStack.current.push({
            text: currentText,
            caret: caretOffsetRef.current,
          });

          if (undoStack.current.length > 100) undoStack.current.shift();
          redoStack.current = [];
          isInputtingRef.current = true;
          latestTextRef.current = newText;
        }
      }
    },
    [sendTextPatch],
  );

  // 일반 입력 처리
  const processInput = useCallback((forceSync = false) => {
    if (!contentRef.current) return;

    const newText = collectText(contentRef.current);

    if (newText === '') {
      caretOffsetRef.current = 0;
    } else {
      const { start } = getCaretPosition(contentRef.current);
      caretOffsetRef.current = start;
    }

    updateText(newText, {
      forceParentSync: forceSync,
      skipVersionIncrement: forceSync ? true : undefined,
    });
  }, [updateText]);

  // DOM 텍스트 ↔ Ref 동기화용
  const syncDOMToState = useCallback(() => {
    if (!contentRef.current) return;
    const domText = collectText(contentRef.current);
    if (domText !== latestTextRef.current) {
      latestTextRef.current = domText;
    }
  }, []);

  // caret을 리뷰 경계에서 안전하게 정규화하는 함수
  const normalizeCaretAtReviewBoundary = useCallback((): boolean => {
    if (!contentRef.current) return false;
    return normalizeCaretUtil({
      contentEl: contentRef.current,
      reviews: reviewsRef.current,
    });
  }, []);

  const { applyDeleteByDirection, applyDeleteRange, flushPendingDeletes } =
    useCoverLetterDeleteFlow({
      contentRef,
      isComposingRef,
      latestTextRef,
      caretOffsetRef,
      reviewsRef,
      reviewLastKnownRangesRef,
      syncDOMToState,
      updateText,
      onDeleteReviewsByText,
    });

  const insertTextAtCaret = useCallback(
    (insertStr: string) => {
      if (!contentRef.current) return;

      const { start, end } = getCaretPosition(contentRef.current);
      const currentText = latestTextRef.current;
      const newText =
        currentText.slice(0, start) + insertStr + currentText.slice(end);

      caretOffsetRef.current = start + insertStr.length;
      updateText(newText);
    },
    [updateText],
  );

  // caret 복원
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const isFocused = Boolean(el.contains(document.activeElement));
    if (!isInputtingRef.current && !isFocused) return;
    if (isComposingRef.current) return;

    cleanupNonChunkNodes(el);

    const restore = () => {
      const el = contentRef.current;
      if (!el) return;
      if (isComposingRef.current) return;

      if (text === '') {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(el, 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      } else {
        const boundedOffset = Math.min(caretOffsetRef.current, text.length);
        restoreCaret(el, boundedOffset);
      }
    };

    restore();
    isInputtingRef.current = false;
  }, [text, qnAId]);

  const {
    handleInput: rawHandleInput,
    handleCompositionStart,
    handleCompositionEnd: rawHandleCompositionEnd,
  } = useCoverLetterCompositionFlow({
    contentRef,
    isComposingRef,
    lastCompositionEndAtRef,
    processInput,
    normalizeCaretAtReviewBoundary,
    applyDeleteRange,
  });

  const handleInput = useCallback(
    (e: FormEvent<HTMLDivElement>) => {
      const nativeIsComposing = (e.nativeEvent as InputEvent).isComposing;

      if (isComposingRef.current || nativeIsComposing) {
        if (nativeIsComposing && !isComposingRef.current) {
          isComposingRef.current = true;
        }
        if (contentRef.current) {
          const domText = collectText(contentRef.current);
          const caret = getCaretPosition(contentRef.current).start;
          if (domText !== composingDOMTextRef.current) {
            onComposingLengthChange?.(domText.length);
          }
          composingDOMTextRef.current = domText;
          composingDOMCaretRef.current = caret;
        }
        return;
      }
      rawHandleInput();
    },
    [rawHandleInput, onComposingLengthChange],
  );

  const handleCompositionEnd = useCallback(() => {
    flushPendingDeletes();
    rawHandleCompositionEnd();
    composingDOMTextRef.current = null;
    composingDOMCaretRef.current = null;
    onComposingLengthChange?.(null);

    if (enterDuringCompositionRef.current) {
      enterDuringCompositionRef.current = false;
      normalizeCaretAtReviewBoundary();
      insertTextAtCaret('\n');
      window.requestAnimationFrame(() => {
        if (!contentRef.current || isComposingRef.current) return;
        restoreCaret(contentRef.current, caretOffsetRef.current);
        window.requestAnimationFrame(() => {
          if (!contentRef.current || isComposingRef.current) return;
          restoreCaret(contentRef.current, caretOffsetRef.current);
        });
      });
    }
  }, [
    rawHandleCompositionEnd,
    onComposingLengthChange,
    normalizeCaretAtReviewBoundary,
    flushPendingDeletes,
    insertTextAtCaret,
  ]);

  // TEXT_REPLACE_ALL 신호 처리
  useLayoutEffect(() => {
    if (!contentRef.current) return;
    if (prevReplaceAllSignalRef.current === replaceAllSignal) return;
    prevReplaceAllSignalRef.current = replaceAllSignal;

    isProcessingReplaceAllRef.current = true;

    const wasFocused = contentRef.current.contains(document.activeElement);

    const pendingDOMText = isComposingRef.current
      ? composingDOMTextRef.current
      : null;
    const pendingCaretOffset = isComposingRef.current
      ? composingDOMCaretRef.current
      : null;
    composingDOMTextRef.current = null;
    composingDOMCaretRef.current = null;

    const boundedOffset = Math.min(caretOffsetRef.current, text.length);

    isComposingRef.current = false;
    latestTextRef.current = text;

    let targetCaretOffset = boundedOffset;
    if (pendingDOMText !== null && pendingDOMText !== text) {
      targetCaretOffset = pendingCaretOffset ?? boundedOffset;
      caretOffsetRef.current = targetCaretOffset;
      updateText(pendingDOMText, { forceParentSync: true, forceSocket: true });
    }

    let rafId: number | undefined;
    if (wasFocused) {
      contentRef.current.blur();
      rafId = window.requestAnimationFrame(() => {
        if (!contentRef.current) return;
        restoreCaret(contentRef.current, targetCaretOffset);
        queueMicrotask(() => {
          isProcessingReplaceAllRef.current = false;
        });
      });
    } else {
      isProcessingReplaceAllRef.current = false;
    }
    return () => {
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
      isProcessingReplaceAllRef.current = false;
    };
  }, [replaceAllSignal, text, updateText]);

  // Undo/Redo 단축키 바인딩
  useEffect(() => {
    return bindUndoRedoShortcuts({
      contentRef,
      undoStack,
      redoStack,
      getCurrentText: () => latestTextRef.current,
      getCurrentCaret: () => caretOffsetRef.current,
      setCurrentCaret: (caret) => {
        caretOffsetRef.current = caret;
      },
      applyText: (nextText) => {
        const prevText = latestTextRef.current;
        isInputtingRef.current = true;
        latestTextRef.current = nextText;
        const sentBySocket = sendTextPatchRef.current(prevText, nextText);
        onTextChangeRef.current?.(nextText, {
          skipVersionIncrement: sentBySocket,
        });
      },
    });
  }, [sendTextPatchRef]);

  const { handleKeyDown, handlePaste, handleCopy } =
    useCoverLetterInputHandlers({
      isComposingRef,
      lastCompositionEndAtRef,
      normalizeCaretAtReviewBoundary,
      applyDeleteRange,
      insertPlainTextAtCaret: insertTextAtCaret,
      applyDeleteByDirection,
      contentRef,
      caretOffsetRef,
      enterDuringCompositionRef,
    });

  // 청크 계산 + 텍스트 선택 + 스페이서
  const { containerRef, chunks, spacerHeight } = useCoverLetterChunks({
    text,
    reviews,
    editingReview,
    selection,
    selectedReviewId,
    isReviewActive,
    onSelectionChange: handleSelectionChange,
  });

  // 클릭/드래그 후 caret 위치 추적 + 경계 정규화 (handleClick, handleMouseUp 공통)
  const trackAndNormalizeCaret = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (isComposingRef.current || !contentRef.current) return;
      const { start } = getCaretPosition(contentRef.current);
      if (Number.isFinite(start)) {
        caretOffsetRef.current = start;
      }
      normalizeCaretAtReviewBoundary();
    });
  }, [normalizeCaretAtReviewBoundary]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const reviewId = findClickedReviewId(e.target, e.clientX, e.clientY, isReviewActive);
    if (reviewId !== null) onReviewClick(reviewId);
    trackAndNormalizeCaret();
  };

  const handleMouseUp = trackAndNormalizeCaret;

  return (
    <div className='relative ml-12 min-h-0 flex-1'>
      <div
        ref={containerRef}
        className='absolute inset-0 overflow-y-auto rounded-xl border border-gray-200 bg-white px-4 transition-colors hover:border-gray-300'
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
          onCopy={handleCopy}
          onPaste={handlePaste}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onClick={handleClick}
          onMouseUp={handleMouseUp}
          className='w-full cursor-text py-3 text-base leading-7 font-normal text-gray-800 outline-none'
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            paddingBottom: spacerHeight,
          }}
        >
          {chunks.length > 0 ? (
            chunks
          ) : (
            <span aria-hidden='true' className='select-none' data-chunk='true'>
              {'\u200B'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(CoverLetterContent);
