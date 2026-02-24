import { collectText } from '@/features/coverLetter/libs/caret';
import type { Review } from '@/shared/types/review';

interface NormalizeCaretAtReviewBoundaryParams {
  contentEl: HTMLDivElement;
  reviews: Review[];
}

type BoundaryMoveDirection = 'left' | 'right';

const isBoundaryElement = (node: Node | null): node is HTMLElement =>
  Boolean(
    node &&
    node.nodeType === Node.ELEMENT_NODE &&
    ((node as HTMLElement).hasAttribute('data-review-boundary') ||
      (node as HTMLElement).hasAttribute('data-review-tail')),
  );

const setCaretRelativeTo = (
  selection: Selection,
  node: Node,
  direction: BoundaryMoveDirection,
) => {
  const range = document.createRange();
  if (direction === 'left') {
    range.setStartBefore(node);
  } else {
    range.setStartAfter(node);
  }
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

const ensureEditableTextAnchorInNode = (node: Node): Text | null => {
  if (node.nodeType === Node.TEXT_NODE) return node as Text;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const element = node as HTMLElement;
  if (element.getAttribute('contenteditable') === 'false') return null;

  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const firstText = walker.nextNode() as Text | null;
  if (firstText) return firstText;

  const anchor = document.createTextNode('');
  element.appendChild(anchor);
  return anchor;
};

const findBoundaryAtCaret = (
  range: Range,
  direction: BoundaryMoveDirection,
): HTMLElement | null => {
  const { startContainer, startOffset } = range;

  if (isBoundaryElement(startContainer)) {
    return startContainer;
  }

  if (startContainer.nodeType === Node.TEXT_NODE) {
    if (isBoundaryElement(startContainer.parentNode)) {
      return startContainer.parentNode as HTMLElement;
    }
    const textNode = startContainer as Text;
    if (direction === 'right' && startOffset === textNode.length) {
      return isBoundaryElement(textNode.nextSibling)
        ? textNode.nextSibling
        : null;
    }
    if (direction === 'left' && startOffset === 0) {
      return isBoundaryElement(textNode.previousSibling)
        ? textNode.previousSibling
        : null;
    }
    return null;
  }

  if (startContainer.nodeType === Node.ELEMENT_NODE) {
    const element = startContainer as Element;
    const childNodes = element.childNodes;
    const candidate =
      direction === 'right'
        ? (childNodes[startOffset] ?? null)
        : (childNodes[startOffset - 1] ?? null);
    return isBoundaryElement(candidate) ? candidate : null;
  }

  return null;
};

const isReviewGroup = (node: Node | null): node is HTMLElement =>
  Boolean(
    node &&
    node.nodeType === Node.ELEMENT_NODE &&
    (node as HTMLElement).hasAttribute('data-review-group'),
  );

export const moveCaretIntoAdjacentReview = ({
  contentEl,
  direction,
}: {
  contentEl: HTMLDivElement;
  direction: 'left' | 'right';
}): boolean => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
    return false;
  }

  const range = selection.getRangeAt(0);
  if (!contentEl.contains(range.startContainer)) return false;

  const { startContainer, startOffset } = range;

  let reviewGroupEl: HTMLElement | null = null;

  if (startContainer.nodeType === Node.ELEMENT_NODE) {
    const candidate =
      direction === 'left'
        ? ((startContainer as Element).childNodes[startOffset - 1] ?? null)
        : ((startContainer as Element).childNodes[startOffset] ?? null);
    if (isReviewGroup(candidate)) {
      reviewGroupEl = candidate;
    }
  } else if (startContainer.nodeType === Node.TEXT_NODE) {
    const text = startContainer as Text;
    if (direction === 'left' && startOffset === 0) {
      // 텍스트 노드의 부모(span[data-chunk]) 앞 형제가 review-group인지 확인
      const parent = text.parentNode;
      const prev =
        parent && parent !== contentEl
          ? (parent as Element).previousSibling
          : null;
      if (isReviewGroup(prev)) {
        reviewGroupEl = prev;
      }
    } else if (direction === 'right' && startOffset === text.length) {
      // 텍스트 노드의 부모(span[data-chunk]) 뒤 형제가 review-group인지 확인
      const parent = text.parentNode;
      const next =
        parent && parent !== contentEl ? (parent as Element).nextSibling : null;
      if (isReviewGroup(next)) {
        reviewGroupEl = next;
      }
    }
  }

  if (!reviewGroupEl) return false;

  const reviewContentEl =
    reviewGroupEl.querySelector<HTMLElement>('[data-review-id]');
  if (!reviewContentEl) return false;

  const newRange = document.createRange();
  const walker = document.createTreeWalker(
    reviewContentEl,
    NodeFilter.SHOW_TEXT,
  );

  if (direction === 'left') {
    // 리뷰 텍스트 끝으로 진입
    let lastText: Text | null = null;
    let node: Node | null;
    while ((node = walker.nextNode())) {
      lastText = node as Text;
    }
    if (lastText) {
      const txt = lastText.textContent ?? '';
      let offset = txt.length;
      while (
        offset > 0 &&
        (txt[offset - 1] === '\u200B' || txt[offset - 1] === '\u2060')
      ) {
        offset--;
      }
      newRange.setStart(lastText, offset);
    } else {
      newRange.setStart(reviewContentEl, reviewContentEl.childNodes.length);
    }
  } else {
    // 리뷰 텍스트 처음으로 진입
    const firstText = walker.nextNode() as Text | null;
    if (firstText) {
      const txt = firstText.textContent ?? '';
      let offset = 0;
      while (
        offset < txt.length &&
        (txt[offset] === '\u200B' || txt[offset] === '\u2060')
      ) {
        offset++;
      }
      newRange.setStart(firstText, offset);
    } else {
      newRange.setStart(reviewContentEl, 0);
    }
  }

  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);
  return true;
};

export const moveCaretAcrossReviewBoundaryMarker = ({
  contentEl,
  direction,
}: {
  contentEl: HTMLDivElement;
  direction: BoundaryMoveDirection;
}): boolean => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
    return false;
  }

  const range = selection.getRangeAt(0);
  if (!contentEl.contains(range.startContainer)) return false;

  const boundary = findBoundaryAtCaret(range, direction);
  if (!boundary) return false;

  setCaretRelativeTo(selection, boundary, direction);
  return true;
};

export const normalizeCaretAtReviewBoundary = ({
  contentEl,
  reviews,
}: NormalizeCaretAtReviewBoundaryParams): boolean => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
    return false;
  }

  const currentRange = selection.getRangeAt(0);
  if (!contentEl.contains(currentRange.startContainer)) return false;

  // 절대 텍스트 오프셋 기준으로 경계를 우선 보정한다.
  // 브라우저가 경계 캐럿을 내부 텍스트 노드로 재배치하는 IME 케이스를 방지한다.
  const absoluteCaretOffset = (() => {
    const prefixRange = document.createRange();
    prefixRange.selectNodeContents(contentEl);
    prefixRange.setEnd(currentRange.startContainer, currentRange.startOffset);
    return collectText(prefixRange.cloneContents()).length;
  })();

  const getNextEditableSibling = (node: Node | null): Node | null => {
    let current = node;
    while (current) {
      if (
        current.nodeType === Node.ELEMENT_NODE &&
        (isBoundaryElement(current) ||
          (current as HTMLElement).getAttribute('contenteditable') === 'false')
      ) {
        current = current.nextSibling;
        continue;
      }
      return current;
    }
    return null;
  };

  const moveCaretOutsideReview = (
    reviewId: number,
    direction: 'start' | 'end',
  ): boolean => {
    const wrapper = contentEl.querySelector<HTMLElement>(
      `[data-review-id="${reviewId}"]`,
    );
    if (!wrapper) return false;

    // outer contentEditable=false group wrapper를 기준으로 커서를 이동한다.
    // inner review-wrap(data-review-id)의 sibling은 모두 outer wrapper 내부에 있어
    // outer wrapper 밖의 editable 영역을 찾지 못하는 문제가 있다.
    const reviewGroupWrapper =
      wrapper.closest<HTMLElement>('[data-review-group]') ?? wrapper;

    const range = document.createRange();
    if (direction === 'start') {
      range.setStartBefore(reviewGroupWrapper);
    } else {
      // outer wrapper의 다음 editable sibling에서 텍스트 노드를 찾는다.
      const nextSibling = getNextEditableSibling(
        reviewGroupWrapper.nextSibling,
      );
      const nextText = nextSibling
        ? ensureEditableTextAnchorInNode(nextSibling)
        : null;
      if (nextText) {
        range.setStart(nextText, 0);
      } else {
        range.setStartAfter(reviewGroupWrapper);
      }
    }
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  const startBoundaryReview = reviews.find(
    (review) =>
      review.range.start >= 0 &&
      review.range.end >= 0 &&
      absoluteCaretOffset === review.range.start,
  );
  if (startBoundaryReview) {
    if (moveCaretOutsideReview(startBoundaryReview.id, 'start')) return true;
  }

  const endBoundaryReview = reviews.find(
    (review) =>
      review.range.start >= 0 &&
      review.range.end >= 0 &&
      absoluteCaretOffset === review.range.end,
  );
  if (endBoundaryReview) {
    if (moveCaretOutsideReview(endBoundaryReview.id, 'end')) return true;
  }

  const findReviewWrapper = (node: Node): HTMLElement | null => {
    let current: Node | null = node;
    while (current && current !== contentEl) {
      if (
        current.nodeType === Node.ELEMENT_NODE &&
        (current as HTMLElement).hasAttribute('data-review-id')
      ) {
        return current as HTMLElement;
      }
      current = current.parentNode;
    }
    return null;
  };

  const reviewWrapper = findReviewWrapper(currentRange.startContainer);
  if (!reviewWrapper) return false;

  const reviewId = Number(reviewWrapper.getAttribute('data-review-id'));
  const currentReview = Number.isFinite(reviewId)
    ? reviews.find((review) => review.id === reviewId)
    : undefined;
  if (currentReview) {
    // 리뷰 끝 경계에서 입력을 시작하면 일부 브라우저/IME가 조합 텍스트를
    // 리뷰 span 내부에 붙이는 경우가 있다. 절대 오프셋이 리뷰 end 이상이면
    // 리뷰 바깥(래퍼 뒤)으로 강제 보정해 범위 오염을 막는다.
    if (absoluteCaretOffset >= currentReview.range.end) {
      if (moveCaretOutsideReview(currentReview.id, 'end')) return true;
    }
  }

  const leadingRange = document.createRange();
  leadingRange.selectNodeContents(reviewWrapper);
  leadingRange.setEnd(currentRange.startContainer, currentRange.startOffset);
  const trailingRange = document.createRange();
  trailingRange.selectNodeContents(reviewWrapper);
  trailingRange.setStart(currentRange.startContainer, currentRange.startOffset);
  const leadingTextLength = collectText(leadingRange.cloneContents()).length;
  const trailingTextLength = collectText(trailingRange.cloneContents()).length;
  const isAtStartBoundary = leadingTextLength === 0;
  const isAtEndBoundary = trailingTextLength === 0;
  if (isAtStartBoundary) {
    return moveCaretOutsideReview(reviewId, 'start');
  }

  if (!isAtEndBoundary) {
    return false;
  }

  return moveCaretOutsideReview(reviewId, 'end');
};
