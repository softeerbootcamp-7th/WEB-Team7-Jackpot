import type { Review } from '@/features/review/types/review';

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
 * DOM Range를 텍스트 인덱스로 변환
 */
export const rangeToTextIndices = (container: HTMLElement, range: Range) => {
  const startRange = document.createRange();
  startRange.setStart(container, 0);
  startRange.setEnd(range.startContainer, range.startOffset);
  const start = startRange.toString().length;

  const endRange = document.createRange();
  endRange.setStart(container, 0);
  endRange.setEnd(range.endContainer, range.endOffset);
  const end = endRange.toString().length;

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
      !(rangeEnd <= h.start || rangeStart >= h.end) && review.isValid !== false
    );
  });
};
