import { type RefObject, useCallback } from 'react';
import { flushSync } from 'react-dom';

import { getCaretPosition } from '@/features/coverLetter/libs/caret';

interface UseCoverLetterCompositionFlowParams {
  contentRef: RefObject<HTMLDivElement | null>;
  isComposingRef: RefObject<boolean>;
  lastCompositionEndAtRef: RefObject<number>;
  processInput: (forceSync?: boolean) => void;
  normalizeCaretAtReviewBoundary: () => boolean;
  applyDeleteRange: (start: number, end: number, textToInsert?: string) => void;
}

export const useCoverLetterCompositionFlow = ({
  contentRef,
  isComposingRef,
  lastCompositionEndAtRef,
  processInput,
  normalizeCaretAtReviewBoundary,
  applyDeleteRange,
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

    // 드래그 선택 상태에서 IME가 시작되면 브라우저가 contentEditable=false 영역을 포함한
    // 선택 범위를 직접 DOM에서 삭제한다. React는 이 변경을 모르기 때문에
    // 이후 reconcile 시 removeChild 에러가 발생한다.
    //
    // flushSync로 React state·DOM을 동기적으로 업데이트한다.
    // flushSync 내부에서 useLayoutEffect까지 실행되어 캐럿이 start 위치로 복원되고,
    // 이후 브라우저 IME는 깨끗한 DOM에서 composition을 시작한다.
    if (contentRef.current) {
      const selection = window.getSelection();
      if (
        selection &&
        !selection.isCollapsed &&
        contentRef.current.contains(selection.anchorNode)
      ) {
        const { start, end } = getCaretPosition(contentRef.current);
        if (start !== end) {
          flushSync(() => {
            applyDeleteRange(start, end);
          });
        }
      }
    }

    // 선택 범위 삭제(있었다면) 이후에 composing 플래그 설정
    isComposingRef.current = true;
    normalizeCaretAtReviewBoundary();
  }, [
    applyDeleteRange,
    contentRef,
    isComposingRef,
    normalizeCaretAtReviewBoundary,
  ]);

  const handleCompositionEnd = useCallback(() => {
    if (!isComposingRef.current) return;

    isComposingRef.current = false;

    lastCompositionEndAtRef.current = Date.now();
    processInput(true);
  }, [isComposingRef, lastCompositionEndAtRef, processInput]);

  return {
    handleInput,
    handleCompositionStart,
    handleCompositionEnd,
  };
};
