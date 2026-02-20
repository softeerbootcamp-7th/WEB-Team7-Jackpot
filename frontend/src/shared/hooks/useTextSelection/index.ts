import { useCallback, useEffect, useMemo, useRef } from 'react';

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
  selectedText: string,
): SelectionInfo | null => {
  const { start, end } = rangeToTextIndices(container, range);
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
      selectedText,
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
    selectedText,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionTimeoutRef = useRef<number | null>(null);

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
    let timeoutId: number | undefined;

    const { range, originText } = editingReview;
    const startPos = findNodeAtIndex(containerRef.current, range.start);
    const endPos = findNodeAtIndex(containerRef.current, range.end);

    if (!startPos || !endPos) return;

    const domRange = document.createRange();
    domRange.setStart(startPos.node, startPos.offset);
    domRange.setEnd(endPos.node, endPos.offset);

    // 편집 모드일 때는 먼저 스크롤을 맞춘 뒤 모달 위치를 재계산하여 전달
    const editRects = domRange.getClientRects();
    if (editRects.length > 0) {
      const firstRect = editRects[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const offset = firstRect.top - containerRect.top;
      const desiredScrollTop = containerRef.current.scrollTop + offset;

      containerRef.current.style.overflowY = 'auto';
      containerRef.current.scrollTo({
        top: Math.max(0, Math.floor(desiredScrollTop)),
        behavior: 'smooth',
      });

      timeoutId = window.setTimeout(() => {
        containerRef.current?.style.removeProperty('overflowY');
        const modalInfoAfter = calculateModalInfo(
          containerRef.current!,
          domRange,
          originText,
        );
        if (modalInfoAfter) onSelectionChange(modalInfoAfter);
      }, 300);
    } else {
      const modalInfo = calculateModalInfo(
        containerRef.current,
        domRange,
        originText,
      );
      if (modalInfo) onSelectionChange(modalInfo);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [editingReview, onSelectionChange]);

  // 하이라이트 적용
  const highlights = useMemo(
    () => [
      ...reviews
        .filter(
          (r) =>
            r.viewStatus === 'PENDING' || r.viewStatus === 'ACCEPTED',
        )
        .map((r) => r.range),
      ...(selection && !editingReview ? [selection.range] : []),
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
      alert('이미 첨삭이 등록된 영역입니다.');
      return;
    }

    const selectedText = sel.toString();
    const rects = range.getClientRects();

    if (rects.length > 0) {
      const firstRect = rects[0];
      const lastLineRect = rects[rects.length - 1];
      const containerRect = containerRef.current.getBoundingClientRect();

      const lineEndIndex = findLineEndIndex(
        containerRef.current,
        end,
        lastLineRect.bottom,
      );

      const offset = firstRect.top - containerRect.top;
      const desiredScrollTop = containerRef.current.scrollTop + offset;

      const selectionHeight = lastLineRect.bottom - firstRect.top;
      const modalTop = containerRect.top + selectionHeight + 10;
      const modalLeft = lastLineRect.left;

      containerRef.current.style.overflowY = 'auto';
      containerRef.current.scrollTo({
        top: Math.max(0, Math.floor(desiredScrollTop)),
        behavior: 'smooth',
      });

      selectionTimeoutRef.current = window.setTimeout(() => {
        containerRef.current?.style.removeProperty('overflowY');
        onSelectionChange({
          selectedText,
          range: { start, end },
          modalTop,
          modalLeft,
          lineEndIndex,
        });
      }, 300);
    } else {
      const modalInfo = calculateModalInfo(
        containerRef.current,
        range,
        selectedText,
      );
      if (modalInfo) onSelectionChange(modalInfo);
    }
  }, [reviews, onSelectionChange]);

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
