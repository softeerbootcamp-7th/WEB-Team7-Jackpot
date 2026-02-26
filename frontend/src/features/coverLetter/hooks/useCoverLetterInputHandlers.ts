import {
  type ClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useCallback,
} from 'react';

import {
  getCaretPosition,
  restoreCaret,
} from '@/features/coverLetter/libs/caret';
import { moveCaretIntoAdjacentReview } from '@/features/coverLetter/libs/caretBoundary';
import type { DeleteDirection } from '@/features/coverLetter/libs/deleteUtils';

interface UseCoverLetterInputHandlersParams {
  isComposingRef: RefObject<boolean>;
  lastCompositionEndAtRef: RefObject<number>;
  normalizeCaretAtReviewBoundary: () => boolean;
  applyDeleteRange: (start: number, end: number, textToInsert?: string) => void;
  insertPlainTextAtCaret: (text: string) => void;
  applyDeleteByDirection: (direction: DeleteDirection) => void;
  contentRef: RefObject<HTMLDivElement | null>;
  caretOffsetRef: RefObject<number>;
  enterDuringCompositionRef: RefObject<boolean>;
}

export const useCoverLetterInputHandlers = ({
  isComposingRef,
  lastCompositionEndAtRef,
  normalizeCaretAtReviewBoundary,
  applyDeleteRange,
  insertPlainTextAtCaret,
  applyDeleteByDirection,
  contentRef,
  caretOffsetRef,
  enterDuringCompositionRef,
}: UseCoverLetterInputHandlersParams) => {
  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const native = e.nativeEvent;

      const isImeProcessKey =
        e.key === 'Process' || native.keyCode === 229 || native.isComposing;

      // Enter는 조합 중이라도 줄바꿈 트리거로 처리한다.
      // isImeProcessKey 가드보다 앞에 배치해야 한글 조합 중 Enter가 무시되는 버그를 막는다.
      // (조합 중 Enter: nativeEvent.isComposing=true → isImeProcessKey=true → 기존 코드에서
      //  early return 되어 Enter가 두 번 눌러야 동작하던 문제)
      if (e.key === 'Enter') {
        e.preventDefault();

        // Chrome에서는 한글 등 조합 입력(IME) 중 Enter를 누르면
        // compositionEnd 직후에 isComposing=false 상태의
        // "에코(중복) Enter keydown" 이벤트가 한 번 더 발생한다.
        //
        // lastCompositionEndAtRef는 이 핸들러 안에서
        // handleCompositionEnd가 호출될 때 설정되므로,
        // compositionEnd 이후 30ms 이내에 발생한
        // 에코 Enter(elapsed < 30ms)는 안전하게 무시할 수 있다.
        const elapsed = Date.now() - lastCompositionEndAtRef.current;
        if (!isComposingRef.current && elapsed < 30) {
          return;
        }

        if (isComposingRef.current) {
          // 조합 중 Enter: 브라우저가 compositionEnd에서 자연스럽게 조합을 확정한다.
          // compositionEnd 핸들러에서 '\n'을 삽입하도록 플래그를 세우고 여기서는 종료.
          // (수동으로 compositionEnd를 호출하면 브라우저가 이후 DOM에 조합 문자를 다시 삽입해
          //  React 상태와 DOM이 불일치하는 문제가 발생한다.)
          enterDuringCompositionRef.current = true;
          return;
        }

        normalizeCaretAtReviewBoundary();

        // 줄바꿈 삽입
        insertPlainTextAtCaret('\n');

        // DOM 반영 후 caret 복원 2단계
        window.requestAnimationFrame(() => {
          if (!contentRef.current) return;
          if (isComposingRef.current) return;
          restoreCaret(contentRef.current, caretOffsetRef.current);

          window.requestAnimationFrame(() => {
            if (!contentRef.current) return;
            if (isComposingRef.current) return;
            restoreCaret(contentRef.current, caretOffsetRef.current);
          });
        });

        return;
      }

      // OS 레벨에서 IME가 처리 중인 키는 항상 무시한다.
      if (isImeProcessKey) return;

      if (isComposingRef.current) return;

      const isPrintable =
        e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

      if (isPrintable) {
        const selection = window.getSelection();
        if (
          selection &&
          !selection.isCollapsed &&
          contentRef.current?.contains(selection.anchorNode)
        ) {
          const { start, end } = getCaretPosition(contentRef.current);
          if (start !== end) {
            e.preventDefault();
            applyDeleteRange(start, end, e.key);
            return;
          }
        }
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (contentRef.current) {
          // 1. 첨삭 영역(Review) 바로 앞/뒤라면 강제로 점프해서 진입
          const moved = moveCaretIntoAdjacentReview({
            contentEl: contentRef.current,
            direction: e.key === 'ArrowLeft' ? 'left' : 'right',
          });

          if (moved) {
            // 수동 이동에 성공했다면 브라우저의 기본 이동(1단계 멈춤)을 완전히 차단
            e.preventDefault();
            return;
          }
        }

        // 2. 첨삭 영역 진입 상황이 아닐 때 (일반 텍스트 사이 이동 등)
        // 브라우저가 이동을 마친 직후, 캐럿이 첨삭 영역 '경계'에 걸렸는지 확인하여 보정
        window.requestAnimationFrame(() => {
          if (!contentRef.current) return;

          // 주의: normalizeCaretAtReviewBoundary 호출 시 필요한 인자들을 전달해야 합니다.
          normalizeCaretAtReviewBoundary();
        });

        return;
      }

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
      applyDeleteRange,
      insertPlainTextAtCaret,
      isComposingRef,
      lastCompositionEndAtRef,
      normalizeCaretAtReviewBoundary,
      caretOffsetRef,
      contentRef,
      enterDuringCompositionRef,
    ],
  );

  // ISSUE FIX: 첨삭 영역을 포함한 곳 복사 > 붙여넣기 시, 첨삭 영역 늘어남
  // 기존 copy시에 내부 첨삭 태그까지 함께 복사되었음. > plain text만 뽑아서 copy 되도록 수정
  const handleCopy = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      if (!contentRef.current?.contains(range.startContainer)) return;

      let text = range.toString();
      text = text.replace(/\u200B/g, '');
      console.log(text);
      e.clipboardData.setData('text/plain', text);
    },
    [contentRef],
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
    handleCopy,
  };
};
