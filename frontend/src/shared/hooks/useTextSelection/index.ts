import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import {
  buildTextChunks,
  findLineEndIndex,
  findNodeAtIndex,
  isRangeOverlapping,
  rangeToTextIndices,
  splitChunksAtIndex,
} from '@/shared/hooks/useTextSelection/helpers';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

interface UseTextSelectionProps {
  text: string;
  reviews: Review[];
  editingReview: Review | null;
  selection: SelectionInfo | null;
  onSelectionChange: (selection: SelectionInfo | null) => void;
}

/**
 * Range로부터 모달 정보 계산
 */
const calculateModalInfo = (
  container: HTMLElement,
  range: Range,
  selectionText: string,
  precomputedIndices?: { start: number; end: number },
): SelectionInfo | null => {
  const { start, end } =
    precomputedIndices ?? rangeToTextIndices(container, range);
  const rects = range.getClientRects();
  if (rects.length === 0) return null;

  const lastLineRect = rects[rects.length - 1];
  const lineEndIndex = findLineEndIndex(container, end, lastLineRect.bottom);

  const PADDING = 10;

  const endNode = range.endContainer as Node;
  const endElement =
    endNode.nodeType === Node.TEXT_NODE
      ? (endNode.parentElement as HTMLElement)
      : (endNode as HTMLElement);

  if (!endElement) {
    return {
      selectedText: selectionText,
      range: { start, end },
      modalTop: lastLineRect.bottom,
      modalLeft: lastLineRect.left,
      lineEndIndex,
    };
  }

  const annotatedHeight = endElement.offsetHeight || lastLineRect.height || 0;

  const containerRect = container.getBoundingClientRect();

  const modalTopViewport = containerRect.top + annotatedHeight + PADDING;
  const modalLeftViewport = lastLineRect.left;

  return {
    selectedText: selectionText,
    range: { start, end },
    modalTop: modalTopViewport,
    modalLeft: modalLeftViewport,
    lineEndIndex,
  };
};

export const useTextSelection = ({
  text,
  reviews,
  editingReview,
  selection,
  onSelectionChange,
}: UseTextSelectionProps) => {
  const { showToast } = useToastMessageContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionTimeoutRef = useRef<number | null>(null);

  const scrollIntoViewAndSetSelection = useCallback(
    (range: Range, text: string) => {
      if (!containerRef.current) return;
      if (selectionTimeoutRef.current !== null) {
        window.clearTimeout(selectionTimeoutRef.current);
        selectionTimeoutRef.current = null;
      }

      const rects = range.getClientRects();
      if (rects.length === 0) {
        selectionTimeoutRef.current = null;
        return;
      }

      // 텍스트 인덱스를 지금 추출 (300ms 후에는 DOM이 바뀌어 range가 무효화될 수 있음)
      const { start, end } = rangeToTextIndices(containerRef.current, range);

      const firstRect = rects[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const offset = firstRect.top - containerRect.top;
      const desiredScrollTop = containerRef.current.scrollTop + offset;

      containerRef.current.style.overflowY = 'auto';
      containerRef.current.scrollTo({
        top: Math.max(0, Math.floor(desiredScrollTop)),
        behavior: 'smooth',
      });

      selectionTimeoutRef.current = window.setTimeout(() => {
        if (!containerRef.current) return;
        containerRef.current.style.removeProperty('overflowY');

        // 저장해 둔 텍스트 인덱스로 새 Range 생성 (DOM 변경에 안전)
        const startPos = findNodeAtIndex(containerRef.current, start);
        const endPos = findNodeAtIndex(containerRef.current, end);
        if (startPos && endPos) {
          try {
            const freshRange = document.createRange();
            freshRange.setStart(startPos.node, startPos.offset);
            freshRange.setEnd(endPos.node, endPos.offset);
            const modalInfo = calculateModalInfo(
              containerRef.current,
              freshRange,
              text,
            );
            if (modalInfo) {
              onSelectionChange(modalInfo);
              return;
            }
          } catch {
            // range 생성 실패 시 아래 fallback으로
          }
        }
        // fallback: 원본 range로 재시도
        const modalInfo = calculateModalInfo(containerRef.current, range, text);
        if (modalInfo) onSelectionChange(modalInfo);
      }, 300);
    },
    [onSelectionChange],
  );

  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current !== null) {
        window.clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  // editingReview 처리
  useEffect(() => {
    if (!editingReview || !containerRef.current) return;

    const { range, originText } = editingReview;
    if (range.start < 0 || range.end < 0 || range.start >= range.end) {
      onSelectionChange(null);
      return;
    }
    const startPos = findNodeAtIndex(containerRef.current, range.start);
    const endPos = findNodeAtIndex(containerRef.current, range.end);

    if (!startPos || !endPos) {
      onSelectionChange(null);
      return;
    }

    const domRange = document.createRange();
    domRange.setStart(startPos.node, startPos.offset);
    domRange.setEnd(endPos.node, endPos.offset);

    scrollIntoViewAndSetSelection(domRange, originText);

    return () => {
      if (selectionTimeoutRef.current) {
        window.clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [editingReview, onSelectionChange, scrollIntoViewAndSetSelection]);

  // selection.range가 바뀔 때마다 DOM에서 modalTop/modalLeft를 즉시 재계산
  const lastRecalcRangeRef = useRef<{ start: number; end: number } | null>(
    null,
  );
  const lastRecalcTextRef = useRef(text);

  useLayoutEffect(() => {
    if (!selection || !containerRef.current) {
      lastRecalcRangeRef.current = null;
      return;
    }

    const { start, end } = selection.range;
    const textChanged = lastRecalcTextRef.current !== text;

    // 같은 range이고 텍스트도 변경되지 않았으면 이미 계산했으므로 건너뜀 (무한 루프 방지)
    const last = lastRecalcRangeRef.current;
    if (!textChanged && last && last.start === start && last.end === end)
      return;

    lastRecalcRangeRef.current = { start, end };
    lastRecalcTextRef.current = text;

    const startPos = findNodeAtIndex(containerRef.current, start);
    const endPos = findNodeAtIndex(containerRef.current, end);
    if (!startPos || !endPos) return;

    let domRange: Range;
    try {
      domRange = document.createRange();
      domRange.setStart(startPos.node, startPos.offset);
      domRange.setEnd(endPos.node, endPos.offset);
    } catch {
      return;
    }

    const modalInfo = calculateModalInfo(
      containerRef.current,
      domRange,
      text.slice(start, end),
      { start, end },
    );
    if (!modalInfo) return;
    const { modalTop, modalLeft } = modalInfo;

    if (
      Math.abs(modalTop - selection.modalTop) < 1 &&
      Math.abs(modalLeft - selection.modalLeft) < 1
    ) {
      return;
    }

    onSelectionChange({ ...selection, modalTop, modalLeft });
  }, [selection, onSelectionChange, text]);

  // 하이라이트 적용
  const highlights = useMemo(
    () => [
      ...reviews
        .filter((r) => r.range.start >= 0 && r.range.end > r.range.start)
        .map((r) => ({
          ...r.range,
          isActive: editingReview?.id === r.id,
        })),
      ...(selection && !editingReview
        ? [{ ...selection.range, isActive: true }]
        : []),
    ],
    [reviews, selection, editingReview],
  );

  const chunks = useMemo(
    () => buildTextChunks(text, highlights),
    [text, highlights],
  );

  // 텍스트 선택 처리
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) return;
    if (selectionTimeoutRef.current !== null) {
      window.clearTimeout(selectionTimeoutRef.current);
      selectionTimeoutRef.current = null;
    }

    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) return;

    const { start, end } = rangeToTextIndices(containerRef.current, range);

    if (isRangeOverlapping(start, end, reviews)) {
      sel.removeAllRanges();
      showToast('이미 첨삭이 등록된 영역입니다.');
      return;
    }

    const selectedText = sel.toString();
    scrollIntoViewAndSetSelection(range, selectedText);
  }, [reviews, showToast, scrollIntoViewAndSetSelection]);

  const { before, after } = useMemo(() => {
    if (!selection) {
      return { before: chunks, after: [] };
    }
    return splitChunksAtIndex(chunks, selection.lineEndIndex);
  }, [chunks, selection]);

  return {
    containerRef,
    handleMouseUp,
    before,
    after,
  };
};
