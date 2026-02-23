import { type RefObject, useCallback, useEffect } from 'react';

interface UseCoverLetterCompositionFlowParams {
  contentRef: RefObject<HTMLDivElement | null>;
  latestTextRef: RefObject<string>;
  isComposingRef: RefObject<boolean>;
  lastCompositionEndAtRef: RefObject<number>;
  composingLastSentTextRef: RefObject<string | null>;
  clearComposingFlushTimer: () => void;
  processInput: (forceSync?: boolean) => void;
  normalizeCaretAtReviewBoundary: () => boolean;
}

export const useCoverLetterCompositionFlow = ({
  contentRef,
  latestTextRef,
  isComposingRef,
  lastCompositionEndAtRef,
  composingLastSentTextRef,
  clearComposingFlushTimer,
  processInput,
  normalizeCaretAtReviewBoundary,
}: UseCoverLetterCompositionFlowParams) => {
  const handleInput = useCallback(() => {
    if (!contentRef.current) return;

    if (isComposingRef.current) {
      return;
    }

    processInput();
  }, [contentRef, isComposingRef, processInput]);

  const handleCompositionStart = useCallback(() => {
    if (isComposingRef.current) return;
    normalizeCaretAtReviewBoundary();
    clearComposingFlushTimer();
    composingLastSentTextRef.current = latestTextRef.current;
    isComposingRef.current = true;
  }, [
    clearComposingFlushTimer,
    composingLastSentTextRef,
    isComposingRef,
    latestTextRef,
    normalizeCaretAtReviewBoundary,
  ]);

  const handleCompositionEnd = useCallback(() => {
    if (!isComposingRef.current) return;

    isComposingRef.current = false;

    clearComposingFlushTimer();

    lastCompositionEndAtRef.current = Date.now();
    composingLastSentTextRef.current = null;

    processInput(true);
  }, [
    clearComposingFlushTimer,
    composingLastSentTextRef,
    isComposingRef,
    lastCompositionEndAtRef,
    processInput,
  ]);

  useEffect(
    () => () => {
      clearComposingFlushTimer();
    },
    [clearComposingFlushTimer],
  );

  return {
    handleInput,
    handleCompositionStart,
    handleCompositionEnd,
  };
};
