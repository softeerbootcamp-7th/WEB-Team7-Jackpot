import {
  type FormEvent,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';

import { useCoverLetterCompositionFlow } from '@/features/coverLetter/hooks/useCoverLetterCompositionFlow';
import { useCoverLetterDeleteFlow } from '@/features/coverLetter/hooks/useCoverLetterDeleteFlow';
import { useCoverLetterInputHandlers } from '@/features/coverLetter/hooks/useCoverLetterInputHandlers';
import { buildChunks } from '@/features/coverLetter/libs/buildChunks';
import {
  collectText,
  getCaretPosition,
  restoreCaret,
} from '@/features/coverLetter/libs/caret';
import { normalizeCaretAtReviewBoundary as normalizeCaretAtReviewBoundaryUtil } from '@/features/coverLetter/libs/caretBoundary';
import { reconcileReviewTrackingState } from '@/features/coverLetter/libs/reviewTracking';
import { createTextUpdatePayload } from '@/features/coverLetter/libs/textPatchUtils';
import { bindUndoRedoShortcuts } from '@/features/coverLetter/libs/undoRedo';
import type { TextChangeResult } from '@/features/coverLetter/types/coverLetter';
import {
  calculateTextChange,
  updateReviewRanges,
} from '@/shared/hooks/useReviewState/helpers';
import { useTextSelection } from '@/shared/hooks/useTextSelection';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';
import type { WriterMessageType } from '@/shared/types/websocket';

const DUPLICATE_PATCH_WINDOW_MS = 150;

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
  const [spacerHeight, setSpacerHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInputtingRef = useRef(false);
  const caretOffsetRef = useRef(0);
  const isComposingRef = useRef(false);
  const lastCompositionEndAtRef = useRef(0);
  const composingLastSentTextRef = useRef<string | null>(null);
  const lastSentPatchRef = useRef<{
    oldText: string;
    newText: string;
    at: number;
  } | null>(null);
  const composingFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const enterDuringCompositionRef = useRef(false);

  const handleSelectionChange = useCallback(
    (newSelection: SelectionInfo | null) => {
      if (isComposingRef.current) return;
      onSelectionChange(newSelection);
    },
    [onSelectionChange],
  );

  const { containerRef, before, after } = useTextSelection({
    text,
    reviews,
    editingReview,
    selection,
    onSelectionChange: handleSelectionChange,
  });

  const prevReplaceAllSignalRef = useRef(replaceAllSignal);
  const latestTextRef = useRef(text);
  const reviewsRef = useRef(reviews);
  const reviewLastKnownRangesRef = useRef<
    Record<number, { start: number; end: number }>
  >({});

  useEffect(() => {
    reviewsRef.current = reviews;
    const { nextLastKnownRanges } = reconcileReviewTrackingState({
      reviews,
      prevLastKnownRanges: reviewLastKnownRangesRef.current,
    });
    reviewLastKnownRangesRef.current = nextLastKnownRanges;
  }, [reviews]);

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
    // qnA 전환/버전 동기화 시 조합 상태를 항상 정리한다.
    // 포커스/커서 복원은 replaceAllSignal 경로에서만 처리한다.
    isComposingRef.current = false;
    if (composingFlushTimerRef.current) {
      clearTimeout(composingFlushTimerRef.current);
      composingFlushTimerRef.current = null;
    }
  }, [currentVersion, qnAId]);

  useEffect(() => {
    const hasExternalTextUpdate = text !== latestTextRef.current;

    if (hasExternalTextUpdate && isComposingRef.current) {
      isComposingRef.current = false;
      if (composingFlushTimerRef.current) {
        clearTimeout(composingFlushTimerRef.current);
        composingFlushTimerRef.current = null;
      }
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

  const sendTextPatch = useCallback(
    (oldText: string, newText: string, reviewsForMapping?: Review[]) => {
      if (!isConnected) return false;
      if (!shareId || !qnAId) return false;
      if (!onReserveNextVersion) {
        console.error(
          '[CoverLetterContent] onReserveNextVersion is required when socket is connected.',
        );
        return false;
      }
      if (oldText === newText) return false;
      const now = Date.now();
      const lastSentPatch = lastSentPatchRef.current;
      // 일부 브라우저/IME 조합에서 동일 input이 연달아 올라올 수 있어
      // 짧은 시간 내 동일(old/new) 패치는 한 번만 전송한다.
      if (
        lastSentPatch &&
        lastSentPatch.oldText === oldText &&
        lastSentPatch.newText === newText &&
        now - lastSentPatch.at < DUPLICATE_PATCH_WINDOW_MS
      ) {
        return false;
      }

      const caretAfter = (() => {
        if (contentRef.current?.contains(document.activeElement)) {
          const { start } = getCaretPosition(contentRef.current);
          if (Number.isFinite(start)) return start;
        }
        return caretOffsetRef.current;
      })();

      const mappingReviews = reviewsForMapping ?? reviewsRef.current;
      const payload = createTextUpdatePayload({
        oldText,
        newText,
        caretAfter,
        reviews: mappingReviews,
      });
      const nextVersion = onReserveNextVersion();
      sendMessage(`/pub/share/${shareId}/qna/${qnAId}/text-update`, {
        version: nextVersion,
        startIdx: payload.startIdx,
        endIdx: payload.endIdx,
        replacedText: payload.replacedText,
      } as WriterMessageType);
      lastSentPatchRef.current = { oldText, newText, at: now };
      onTextUpdateSent?.(new Date().toISOString());
      return true;
    },
    [
      isConnected,
      onReserveNextVersion,
      onTextUpdateSent,
      qnAId,
      sendMessage,
      shareId,
    ],
  );

  const sendTextPatchRef = useRef(sendTextPatch);

  useEffect(() => {
    sendTextPatchRef.current = sendTextPatch;
  }, [sendTextPatch]);

  const updateText = useCallback(
    (
      newText: string,
      options?: {
        skipSocket?: boolean;
        skipVersionIncrement?: boolean;
        reviewsForMapping?: Review[];
        removeWholeReviewIds?: number[];
        forceParentSync?: boolean;
      },
    ) => {
      const handleTextChange = onTextChangeRef.current;
      if (!handleTextChange) return;

      const currentText = latestTextRef.current;
      const hasChanged = newText !== currentText;

      if (hasChanged || options?.forceParentSync) {
        const change = calculateTextChange(currentText, newText);
        const sentBySocket =
          !options?.skipSocket && hasChanged && !isComposingRef.current
            ? sendTextPatch(currentText, newText, options?.reviewsForMapping)
            : false;

        if (!isComposingRef.current || options?.forceParentSync) {
          handleTextChange(newText, {
            skipVersionIncrement: options?.skipVersionIncrement ?? sentBySocket,
          });
        }

        if (hasChanged) {
          const reviewsForNextMapping =
            options?.reviewsForMapping ?? reviewsRef.current;
          reviewsRef.current = updateReviewRanges(
            reviewsForNextMapping,
            change.changeStart,
            change.oldLength,
            change.newLength,
            newText,
          );
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
  const processInput = (forceSync = false) => {
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

  const normalizeCaretAtReviewBoundary = useCallback((): boolean => {
    if (!contentRef.current) return false;
    const result = normalizeCaretAtReviewBoundaryUtil({
      contentEl: contentRef.current,
      reviews: reviewsRef.current,
    });
    return result;
  }, []);

  const { applyDeleteByDirection } = useCoverLetterDeleteFlow({
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

      // latestTextRef를 DOM보다 우선 신뢰한다.
      // IME 조합 중 Enter 시 브라우저가 compositionEnd 직후 DOM에 확정 문자를 물리적으로 삽입하므로
      // DOM을 재독하면 이미 처리된 문자가 이중으로 잡힌다.
      // handleCompositionEnd → processInput 경로에서 이미 latestTextRef를 최신화했으므로 DOM 재독 불필요.
      const currentText = latestTextRef.current;
      const newText =
        currentText.slice(0, start) + insertStr + currentText.slice(end);
      caretOffsetRef.current = start + insertStr.length;

      // flushSync: Enter 직후 한글 입력 시 React re-render가 IME 조합 중에 발생해 조합이 깨지는 문제를 방지한다.
      flushSync(() => {
        updateText(newText);
      });
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

    const children = Array.from(el.childNodes);
    for (const child of children) {
      if (
        child.nodeType === Node.TEXT_NODE ||
        (child.nodeType === Node.ELEMENT_NODE &&
          !(child as Element).hasAttribute('data-chunk'))
      ) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          while (child.firstChild) {
            el.insertBefore(child.firstChild, child);
          }
          el.removeChild(child);
        } else {
          el.removeChild(child);
        }
      }
    }

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
    latestTextRef,
    isComposingRef,
    lastCompositionEndAtRef,
    composingLastSentTextRef,
    clearComposingFlushTimer,
    processInput,
    normalizeCaretAtReviewBoundary,
  });

  const handleInput = useCallback(
    (e: FormEvent<HTMLDivElement>) => {
      // Chrome + 한글 IME에서 첫 글자 입력 시 input 이벤트가 compositionStart보다
      // 먼저 발화하는 경우가 있다. nativeEvent.isComposing으로 이를 감지해
      // processInput 호출을 막는다 (DOM을 건드리지 않아 IME 조합이 유지됨).
      const nativeIsComposing = (e.nativeEvent as InputEvent).isComposing;

      if (isComposingRef.current || nativeIsComposing) {
        if (nativeIsComposing && !isComposingRef.current) {
          // compositionStart가 input보다 늦게 발화 → ref를 미리 설정해
          // useLayoutEffect cleanup이 IME DOM 노드를 삭제하는 것을 막는다.
          isComposingRef.current = true;
        }
        if (contentRef.current) {
          onComposingLengthChange?.(collectText(contentRef.current).length);
        }
        return;
      }
      rawHandleInput();
    },
    [rawHandleInput, onComposingLengthChange],
  );

  const handleCompositionEnd = useCallback(() => {
    rawHandleCompositionEnd();
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
    insertTextAtCaret,
  ]);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    if (prevReplaceAllSignalRef.current === replaceAllSignal) return;
    prevReplaceAllSignalRef.current = replaceAllSignal;

    const wasFocused = contentRef.current.contains(document.activeElement);
    if (wasFocused) {
      caretOffsetRef.current = getFocusedCaretOffset();
    }
    const boundedOffset = Math.min(caretOffsetRef.current, text.length);

    isComposingRef.current = false;
    composingLastSentTextRef.current = null;
    clearComposingFlushTimer();
    latestTextRef.current = text;

    let rafId: number | undefined;
    if (wasFocused) {
      contentRef.current.blur();
      rafId = window.requestAnimationFrame(() => {
        if (!contentRef.current) return;
        restoreCaret(contentRef.current, boundedOffset);
      });
    }
    return () => {
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
    };
  }, [replaceAllSignal, text, clearComposingFlushTimer, getFocusedCaretOffset]);

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
  }, []);

  const { handleKeyDown, handlePaste } = useCoverLetterInputHandlers({
    isComposingRef,
    lastCompositionEndAtRef,
    normalizeCaretAtReviewBoundary,
    insertPlainTextAtCaret: insertTextAtCaret,
    applyDeleteByDirection,
    contentRef,
    caretOffsetRef,
    enterDuringCompositionRef,
  });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    let target = e.target as Node;
    if (target.nodeType === Node.TEXT_NODE && target.parentElement) {
      target = target.parentElement;
    }

    if (target.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const reviewEl = (target as Element).closest('[data-review-id]');
    const reviewIdStr = reviewEl?.getAttribute('data-review-id');
    if (reviewIdStr && isReviewActive) {
      // 클릭 좌표가 실제 텍스트를 감싸는 내부 span 위에 있을 때만 리뷰 클릭으로 처리한다.
      // 이렇게 하면 span의 bounding box에 포함되는 빈 공간 클릭을 방지할 수 있다.
      const textSpan = reviewEl?.querySelector('span:not([data-review-id])');
      const checkElement = textSpan || reviewEl;

      if (checkElement) {
        const rects = Array.from(checkElement.getClientRects());
        const isDirectlyOverReview = rects.some(
          (rect) =>
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom,
        );

        if (isDirectlyOverReview) {
          const reviewId = Number(reviewIdStr);
          if (!isNaN(reviewId)) onReviewClick(reviewId);
        }
      }
    }
    // 클릭 후 캐럿이 리뷰 끝 "내부"에 걸리면 첫 입력이 리뷰에 붙을 수 있다.
    // selection 반영 이후 경계를 바깥으로 정규화한다.
    window.requestAnimationFrame(() => {
      if (isComposingRef.current) return;
      normalizeCaretAtReviewBoundary();
    });
  };

  const handleMouseUp = () => {
    // 클릭/드래그 후 브라우저가 실제 캐럿 위치를 반영한 뒤 경계를 정규화한다.
    window.requestAnimationFrame(() => {
      if (isComposingRef.current) return;
      normalizeCaretAtReviewBoundary();
    });
  };

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
