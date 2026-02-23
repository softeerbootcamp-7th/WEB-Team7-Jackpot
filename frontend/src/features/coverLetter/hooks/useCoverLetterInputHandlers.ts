import {
  type ClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useCallback,
} from 'react';

import { restoreCaret } from '@/features/coverLetter/libs/caret';
import type { DeleteDirection } from '@/features/coverLetter/libs/deleteUtils';

interface UseCoverLetterInputHandlersParams {
  isComposingRef: RefObject<boolean>;
  lastCompositionEndAtRef: RefObject<number>;
  normalizeCaretAtReviewBoundary: () => boolean;
  insertPlainTextAtCaret: (text: string) => void;
  applyDeleteByDirection: (direction: DeleteDirection) => void;
  handleCompositionEnd?: () => void;
  contentRef: RefObject<HTMLDivElement | null>;
  caretOffsetRef: RefObject<number>;
}

export const useCoverLetterInputHandlers = ({
  isComposingRef,
  lastCompositionEndAtRef,
  normalizeCaretAtReviewBoundary,
  insertPlainTextAtCaret,
  applyDeleteByDirection,
  handleCompositionEnd,
  contentRef,
  caretOffsetRef,
}: UseCoverLetterInputHandlersParams) => {
  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const native = e.nativeEvent;

      const isImeProcessKey =
        e.key === 'Process' || native.keyCode === 229 || native.isComposing;

      // OS 레벨에서 IME가 처리 중인 키는 항상 무시한다.
      if (isImeProcessKey) return;

      // Enter는 조합 중이라도 줄바꿈 트리거로 처리한다.
      // compositionend가 이미 발생했지만 isComposingRef가 아직 정리되지 않은
      // 타이밍에도 올바르게 동작하도록 isComposingRef 가드보다 앞에 배치한다.
      if (e.key === 'Enter') {
        e.preventDefault();
        normalizeCaretAtReviewBoundary();

        // 조합이 아직 열려 있으면 강제 종료해 latestTextRef를 확정 상태로 만든다.
        if (isComposingRef.current) {
          handleCompositionEnd?.();
        }

        // 줄바꿈 삽입
        insertPlainTextAtCaret('\n');

        // DOM 반영 후 caret 복원 2단계
        window.requestAnimationFrame(() => {
          if (!contentRef.current) return;
          restoreCaret(contentRef.current, caretOffsetRef.current);

          window.requestAnimationFrame(() => {
            if (!contentRef.current) return;
            restoreCaret(contentRef.current, caretOffsetRef.current);
          });
        });

        return;
      }

      if (isComposingRef.current) return;

      if (e.key === 'Backspace') {
        const elapsed = Date.now() - lastCompositionEndAtRef.current;

        if (elapsed < 120) return;

        e.preventDefault();
        normalizeCaretAtReviewBoundary();
        applyDeleteByDirection('backward');
        return;
      }

      if (e.key === 'Delete') {
        const elapsed = Date.now() - lastCompositionEndAtRef.current;

        if (elapsed < 120) return;

        e.preventDefault();
        normalizeCaretAtReviewBoundary();
        applyDeleteByDirection('forward');
        return;
      }
    },
    [
      applyDeleteByDirection,
      insertPlainTextAtCaret,
      isComposingRef,
      lastCompositionEndAtRef,
      normalizeCaretAtReviewBoundary,
      caretOffsetRef,
      contentRef,
      handleCompositionEnd,
    ],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();

      const plainText = e.clipboardData.getData('text/plain');

      if (!plainText) return;

      normalizeCaretAtReviewBoundary();

      insertPlainTextAtCaret(plainText.replace(/\r\n|\r/g, '\n'));
    },
    [insertPlainTextAtCaret, normalizeCaretAtReviewBoundary],
  );

  return {
    handleKeyDown,
    handlePaste,
  };
};
