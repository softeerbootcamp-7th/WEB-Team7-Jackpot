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

// 노션처럼 띄워쓰기나 delete시, 전송될 수 있도록 시간 조절
const DEBOUNCE_TIME = 300;

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
  const isProcessingReplaceAllRef = useRef(false);
  // composition 중 TEXT_REPLACE_ALL이 도착했을 때 재적용하기 위해 저장
  const composingDOMTextRef = useRef<string | null>(null);
  const composingDOMCaretRef = useRef<number | null>(null);

  const handleSelectionChange = useCallback(
    (newSelection: SelectionInfo | null) => {
      if (isComposingRef.current) return;
      onSelectionChange(newSelection);
    },
    [onSelectionChange],
  );

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

  const sendDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const debounceBaseTextRef = useRef<string | null>(null);
  const debounceBaseReviewsRef = useRef<Review[] | null>(null);

  // 예약된 버전을 추적하는 ref
  const reservedVersionRef = useRef<number | null>(null);

  const sendTextPatch = useCallback(
    (
      oldText: string,
      newText: string,
      reviewsForMapping?: Review[],
      options?: { force?: boolean },
    ) => {
      if (!isConnected) return false;
      if (!shareId || !qnAId) return false;
      if (!onReserveNextVersion) {
        console.error('[CoverLetterContent] onReserveNextVersion is required');
        return false;
      }
      if (oldText === newText) return false;

      // 실제 네트워크 전송 함수
      const transmit = (
        fromText: string,
        toText: string,
        reviews: Review[],
        version: number,
      ) => {
        const now = Date.now();
        const lastSentPatch = lastSentPatchRef.current;

        // 중복 체크
        if (
          lastSentPatch &&
          lastSentPatch.oldText === fromText &&
          lastSentPatch.newText === toText &&
          now - lastSentPatch.at < DUPLICATE_PATCH_WINDOW_MS
        ) {
          return;
        }

        if (fromText === toText) return;

        const caretAfter = caretOffsetRef.current;
        const payload = createTextUpdatePayload({
          oldText: fromText,
          newText: toText,
          caretAfter,
          reviews,
        });

        sendMessage(`/pub/share/${shareId}/qna/${qnAId}/text-update`, {
          version,
          startIdx: payload.startIdx,
          endIdx: payload.endIdx,
          replacedText: payload.replacedText,
        } as WriterMessageType);

        lastSentPatchRef.current = {
          oldText: fromText,
          newText: toText,
          at: now,
        };
        onTextUpdateSent?.(new Date().toISOString());
      };

      // FORCE 경로
      if (options?.force) {
        // 1. 진행 중인 debounce가 있다면 취소하고 즉시 flush
        if (sendDebounceTimerRef.current) {
          clearTimeout(sendDebounceTimerRef.current);
          sendDebounceTimerRef.current = null;

          // 대기 중이던 base → current 변경사항이 있다면 먼저 전송
          const pendingBaseText = debounceBaseTextRef.current;
          const pendingBaseReviews = debounceBaseReviewsRef.current;
          const pendingReservedVersion = reservedVersionRef.current;

          if (
            pendingBaseText !== null &&
            pendingReservedVersion !== null &&
            pendingBaseText !== latestTextRef.current
          ) {
            transmit(
              pendingBaseText,
              latestTextRef.current,
              pendingBaseReviews ?? reviewsRef.current,
              pendingReservedVersion,
            );
          }

          // refs 초기화
          debounceBaseTextRef.current = null;
          debounceBaseReviewsRef.current = null;
          reservedVersionRef.current = null;
        }

        // 2. 새로운 버전을 예약하고 즉시 전송
        const immediateVersion = onReserveNextVersion();
        transmit(
          oldText,
          newText,
          reviewsForMapping ?? reviewsRef.current,
          immediateVersion,
        );

        return true;
      }

      // DEBOUNCE 경로 (기존)
      if (sendDebounceTimerRef.current) {
        clearTimeout(sendDebounceTimerRef.current);
      }

      // 첫 번째 입력에서만 base text와 버전을 예약
      if (debounceBaseTextRef.current === null) {
        debounceBaseTextRef.current = oldText;
        debounceBaseReviewsRef.current = reviewsForMapping ?? null;
        reservedVersionRef.current = onReserveNextVersion();
      }

      sendDebounceTimerRef.current = setTimeout(() => {
        sendDebounceTimerRef.current = null;
        const baseText = debounceBaseTextRef.current;
        const baseReviews = debounceBaseReviewsRef.current;
        const reservedVersion = reservedVersionRef.current;

        // refs 초기화
        debounceBaseTextRef.current = null;
        debounceBaseReviewsRef.current = null;
        reservedVersionRef.current = null;

        if (baseText === null || reservedVersion === null) return;

        transmit(
          baseText,
          latestTextRef.current,
          baseReviews ?? reviewsRef.current,
          reservedVersion,
        );
      }, DEBOUNCE_TIME);

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

  useEffect(() => {
    return () => {
      if (sendDebounceTimerRef.current) {
        clearTimeout(sendDebounceTimerRef.current);
        sendDebounceTimerRef.current = null;
      }
    };
  }, []);

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

      // latestTextRef를 DOM보다 우선 신뢰한다.
      // IME 조합 중 Enter 시 브라우저가 compositionEnd 직후 DOM에 확정 문자를 물리적으로 삽입하므로
      // DOM을 재독하면 이미 처리된 문자가 이중으로 잡힌다.
      // handleCompositionEnd → processInput 경로에서 이미 latestTextRef를 최신화했으므로 DOM 재독 불필요.
      const currentText = latestTextRef.current;
      const newText =
        currentText.slice(0, start) + insertStr + currentText.slice(end);

      // sendTextPatch 내부에서 caretOffsetRef를 caretAfter로 사용하므로,
      // DOM 업데이트 이전에 "삽입 후 커서 위치"를 미리 기록해 둔다.
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
    applyDeleteRange,
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
          // TEXT_REPLACE_ALL이 composition 중에 도착하면 React가 DOM을 덮어써서
          // 조합 문자가 사라진다. input 이벤트마다 현재 DOM text·caret을 저장해두고
          // replaceAll 처리 후 재적용한다.
          const domText = collectText(contentRef.current);
          composingDOMTextRef.current = domText;
          composingDOMCaretRef.current = getCaretPosition(
            contentRef.current,
          ).start;
          onComposingLengthChange?.(domText.length);
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

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    if (prevReplaceAllSignalRef.current === replaceAllSignal) return;
    prevReplaceAllSignalRef.current = replaceAllSignal;

    isProcessingReplaceAllRef.current = true;

    const wasFocused = contentRef.current.contains(document.activeElement);

    // composition 중에 TEXT_REPLACE_ALL이 도착한 경우, input 이벤트에서 저장해둔
    // DOM text와 caret을 꺼낸다. React가 DOM을 덮어쓰기 전(useLayoutEffect 시점)이라
    // DOM에서 직접 읽을 수 없으므로 ref에 저장된 값을 사용한다.
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
    composingLastSentTextRef.current = null;
    clearComposingFlushTimer();
    latestTextRef.current = text;

    // composition 중 덮어쓰기가 발생했다면, 저장된 조합 문자를 재적용한다.
    // ex) "ㄱㅁ" (TEXT_REPLACE_ALL) + pendingDOMText="ㄱㅐㅅ" → "ㄱㅐㅅ" 로 복원
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
        // DOM 업데이트 및 커서 복원 후, selectionchange 리스너가 다시 동작하도록 플래그를 해제합니다.
        // 혹시 모를 race condition을 방지하기 위해 microtask로 처리합니다.
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
  }, [replaceAllSignal, text, clearComposingFlushTimer, updateText]);

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

  const handleKeyDownWrapper = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      handleKeyDown(e); // 기존 핸들러 호출

      // 방향키, Home/End 등 네비게이션 키 입력 시, 브라우저가 커서를 이동시킨 후
      // requestAnimationFrame을 사용해 새로운 커서 위치를 추적한다.
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Home',
          'End',
          'PageUp',
          'PageDown',
        ].includes(e.key)
      ) {
        window.requestAnimationFrame(() => {
          if (!contentRef.current) return;
          const { start } = getCaretPosition(contentRef.current);
          if (Number.isFinite(start)) {
            caretOffsetRef.current = start;
          }
        });
      }
    },
    [handleKeyDown],
  );

  const { containerRef, before, after } = useTextSelection({
    text,
    reviews,
    editingReview,
    selection,
    onSelectionChange: handleSelectionChange,
  });

  // 컨테이너 높이에 따라 스페이서 설정
  useEffect(() => {
    if (!containerRef.current) return;
    const lineHeight = 28;
    const el = containerRef.current;
    const update = () => {
      const containerHeight = el.clientHeight;
      setSpacerHeight(Math.max(0, containerHeight - lineHeight));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
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
    // selection/caret 반영 이후 위치를 추적하고 경계를 정규화한다.
    window.requestAnimationFrame(() => {
      if (isComposingRef.current || !contentRef.current) return;

      const { start } = getCaretPosition(contentRef.current);
      if (Number.isFinite(start)) {
        caretOffsetRef.current = start;
      }
      normalizeCaretAtReviewBoundary();
    });
  };

  const handleMouseUp = () => {
    // 드래그해서 selection을 만드는 로직은 reviewer에게만 필요.
    // 여기서는 클릭/드래그 후 caret 위치를 추적하고 경계를 정규화한다.
    window.requestAnimationFrame(() => {
      if (isComposingRef.current || !contentRef.current) return;

      const { start } = getCaretPosition(contentRef.current);
      if (Number.isFinite(start)) {
        caretOffsetRef.current = start;
      }
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
          onKeyDown={handleKeyDownWrapper}
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
