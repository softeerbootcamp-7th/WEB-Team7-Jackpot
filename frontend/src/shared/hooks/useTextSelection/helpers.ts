import type { Review } from '@/shared/types/review';

export interface TextChunk {
  text: string;
  isHighlighted: boolean;
}

/**
 * 하이라이트 영역을 텍스트 청크로 분할
 */
export const buildTextChunks = (
  text: string,
  highlights: { start: number; end: number }[],
): TextChunk[] => {
  if (highlights.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  const sortedHighlights = [...highlights]
    .map((h) => ({
      start: Math.max(0, Math.min(h.start, text.length)),
      end: Math.max(0, Math.min(h.end, text.length)),
    }))
    .filter((h) => h.end > h.start)
    .sort((a, b) => a.start - b.start);

  const chunks: TextChunk[] = [];
  let cursor = 0;

  for (const highlight of sortedHighlights) {
    const start = Math.max(cursor, highlight.start);
    if (cursor < start) {
      chunks.push({
        text: text.slice(cursor, start),
        isHighlighted: false,
      });
    }
    chunks.push({
      text: text.slice(highlight.start, highlight.end),
      isHighlighted: true,
    });
    cursor = highlight.end;
  }

  if (cursor < text.length) {
    chunks.push({ text: text.slice(cursor), isHighlighted: false });
  }

  return chunks;
};

/**
 * TreeWalker로 텍스트 인덱스에 해당하는 DOM 노드 찾기
 */
export const findNodeAtIndex = (
  container: HTMLElement,
  targetIndex: number,
) => {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let accumulated = 0;
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    if (accumulated + node.length >= targetIndex) {
      return { node, offset: targetIndex - accumulated };
    }
    accumulated += node.length;
  }

  return null;
};

/**
 * DOM Range를 실제 데이터(text 상태값) 인덱스로 변환
 */
export const rangeToTextIndices = (container: HTMLElement, range: Range) => {
  if (
    !container.contains(range.startContainer) ||
    !container.contains(range.endContainer)
  )
    return { start: 0, end: 0 };

  // startContainer가 element인 경우, offset은 childNodes 인덱스를 가리킴
  // 이를 실제 자식 노드로 변환하여 비교에 사용
  const resolveTarget = (rangeContainer: Node, rangeOffset: number) => {
    if (rangeContainer.nodeType === Node.ELEMENT_NODE) {
      const children = rangeContainer.childNodes;
      if (rangeOffset < children.length) {
        return { node: children[rangeOffset], offset: 0, resolved: true };
      }
      // offset === childNodes.length → 모든 자식 뒤 (끝 위치)
      return { node: null, offset: rangeOffset, resolved: false };
    }
    return { node: rangeContainer, offset: rangeOffset, resolved: false };
  };

  const startTarget = resolveTarget(range.startContainer, range.startOffset);
  const endTarget = resolveTarget(range.endContainer, range.endOffset);

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
  );

  let start = 0;
  let end = 0;
  let startFound = false;
  let endFound = false;
  let currentOffset = 0;

  let node: Node | null;
  while ((node = walker.nextNode())) {
    // resolved target 매칭: 모든 노드 타입에 대해 먼저 체크
    // (startContainer가 부모 element일 때 자식 노드가 span 등 일반 element일 수 있음)
    if (!startFound && startTarget.resolved && node === startTarget.node) {
      start = currentOffset;
      startFound = true;
    }
    if (!endFound && endTarget.resolved && node === endTarget.node) {
      end = currentOffset;
      endFound = true;
    }

    // 1. <br /> 태그를 \n(1자)로 취급
    if (node.nodeName === 'BR') {
      if (!startFound && node === range.startContainer) {
        start = currentOffset;
        startFound = true;
      }
      if (!endFound && node === range.endContainer) {
        end = currentOffset;
        endFound = true;
      }
      currentOffset += 1;
      continue;
    }

    // 2. 텍스트 노드 처리
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.textContent || '';
      const zwspCount = (nodeText.match(/\u200B/g) || []).length;
      const actualLength = nodeText.length - zwspCount;

      if (!startFound && node === range.startContainer) {
        const textBefore = nodeText.slice(0, range.startOffset);
        const zwspBefore = (textBefore.match(/\u200B/g) || []).length;
        start = currentOffset + (range.startOffset - zwspBefore);
        startFound = true;
      }

      if (!endFound && node === range.endContainer) {
        const textBefore = nodeText.slice(0, range.endOffset);
        const zwspBefore = (textBefore.match(/\u200B/g) || []).length;
        end = currentOffset + (range.endOffset - zwspBefore);
        endFound = true;
      }

      currentOffset += actualLength;
    }
  }

  // startContainer가 element이고 offset === childNodes.length인 경우 (끝 위치)
  if (!startFound) start = currentOffset;
  if (!endFound) end = currentOffset;

  return { start, end };
};

/**
 * 선택 영역의 마지막 줄 끝 인덱스 찾기
 */
export const findLineEndIndex = (
  container: HTMLElement,
  endIndex: number,
  lineBottom: number,
) => {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let accumulated = 0;
  let lineEndIndex = endIndex;
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    for (let i = 0; i < node.length; i++) {
      const currentIndex = accumulated + i;
      if (currentIndex <= endIndex) continue;

      const testRange = document.createRange();
      testRange.setStart(node, i);
      testRange.setEnd(node, i + 1);
      const rect = testRange.getBoundingClientRect();

      if (rect.bottom > lineBottom + 1) {
        return currentIndex;
      }

      lineEndIndex = currentIndex + 1;
    }

    if (lineEndIndex > endIndex && lineEndIndex < accumulated + node.length) {
      break;
    }

    accumulated += node.length;
  }

  return lineEndIndex;
};

/**
 * 청크를 분할점 기준으로 before/after로 나누기
 */
export const splitChunksAtIndex = (chunks: TextChunk[], splitIndex: number) => {
  const before: TextChunk[] = [];
  const after: TextChunk[] = [];
  let accumulated = 0;

  for (const chunk of chunks) {
    const chunkEnd = accumulated + chunk.text.length;

    if (chunkEnd <= splitIndex) {
      before.push(chunk);
    } else if (accumulated >= splitIndex) {
      after.push(chunk);
    } else {
      const split = splitIndex - accumulated;
      before.push({
        text: chunk.text.slice(0, split),
        isHighlighted: chunk.isHighlighted,
      });
      after.push({
        text: chunk.text.slice(split),
        isHighlighted: chunk.isHighlighted,
      });
    }

    accumulated = chunkEnd;
  }

  return { before, after };
};

/**
 * 두 범위가 겹치는지 확인
 */
export const isRangeOverlapping = (
  rangeStart: number,
  rangeEnd: number,
  reviews: Review[],
): boolean => {
  return reviews.some((review) => {
    const h = review.range;
    return (
      !(rangeEnd <= h.start || rangeStart >= h.end) &&
      (review.viewStatus === 'PENDING' || review.viewStatus === 'ACCEPTED')
    );
  });
};
