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

const ensureEditableTextAnchorAfter = (
  node: Node,
  createSpan = true,
): Text | null => {
  const parent = node.parentNode;
  if (!parent) return null;

  let next = node.nextSibling;
  while (next) {
    if (next.nodeType === Node.TEXT_NODE) return next as Text;
    if (
      next.nodeType === Node.ELEMENT_NODE &&
      (next as HTMLElement).getAttribute('contenteditable') !== 'false'
    ) {
      if (isBoundaryElement(next)) {
        next = next.nextSibling;
        continue;
      }
      const first = document
        .createTreeWalker(next, NodeFilter.SHOW_TEXT)
        .nextNode() as Text | null;
      if (first) return first;
    }
    next = next.nextSibling;
  }

  if (!createSpan) {
    const anchor = document.createTextNode('');
    parent.insertBefore(anchor, node.nextSibling);
    return anchor;
  }

  const span = document.createElement('span');
  const anchor = document.createTextNode('');
  span.appendChild(anchor);
  parent.insertBefore(span, node.nextSibling);
  return anchor;
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

    const range = document.createRange();
    if (direction === 'start') {
      range.setStartBefore(wrapper);
    } else {
      let boundary = wrapper.nextElementSibling as HTMLElement | null;
      if (boundary?.hasAttribute('data-review-boundary')) {
        if (boundary.nextElementSibling?.hasAttribute('data-review-tail')) {
          boundary = boundary.nextElementSibling as HTMLElement;
        }
        // IME 시작 안정성을 위해, 가능하면 "노드 경계"가 아니라
        // 실제 텍스트 노드 내부(0)로 캐럿을 둔다.
        const nextSibling = getNextEditableSibling(boundary.nextSibling);
        const nextText = nextSibling
          ? ensureEditableTextAnchorInNode(nextSibling)
          : null;
        if (nextText) {
          range.setStart(nextText, 0);
        } else {
          const anchor = ensureEditableTextAnchorAfter(boundary);
          if (!anchor) {
            return false;
          }
          range.setStart(anchor, 0);
        }
      } else {
        range.setStartAfter(wrapper);
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
    // 커서가 이미 리뷰 외부(예: trailing-cursor-target)에 있으면 정규화 불필요.
    // review-group 외부의 editable 영역에 클릭한 경우 그 위치를 그대로 유지한다.
    const isCaretInsideReviewEl = (() => {
      let cur: Node | null = currentRange.startContainer;
      while (cur && cur !== contentEl) {
        if (cur.nodeType === Node.ELEMENT_NODE) {
          const el = cur as HTMLElement;
          if (
            el.hasAttribute('data-review-id') ||
            el.hasAttribute('data-review-boundary') ||
            el.hasAttribute('data-review-tail')
          ) {
            return true;
          }
        }
        cur = cur.parentNode;
      }
      return false;
    })();
    if (isCaretInsideReviewEl) {
      if (moveCaretOutsideReview(endBoundaryReview.id, 'end')) return true;
    }
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
  const findLastTextNode = (root: Node): Text | null => {
    if (root.nodeType === Node.TEXT_NODE) return root as Text;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let last: Text | null = null;
    let current: Node | null;
    while ((current = walker.nextNode())) {
      last = current as Text;
    }
    return last;
  };

  if (isAtStartBoundary) {
    const prevRange = document.createRange();
    const prevSibling = reviewWrapper.previousSibling;
    const prevTextNode = prevSibling ? findLastTextNode(prevSibling) : null;

    if (prevTextNode) {
      prevRange.setStart(prevTextNode, prevTextNode.textContent?.length ?? 0);
      prevRange.collapse(true);
    } else {
      // DOM에 placeholder(\u200B)를 삽입하면 Backspace가 보이지 않는 문자만
      // 지우는 문제가 생길 수 있어, 노드 경계 위치로 직접 이동한다.
      prevRange.setStartBefore(reviewWrapper);
      prevRange.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(prevRange);
    return true;
  }

  if (!isAtEndBoundary) {
    return false;
  }

  const nextRange = document.createRange();
  const findFirstTextNode = (root: Node): Text | null => {
    if (root.nodeType === Node.TEXT_NODE) return root as Text;
    if (
      root.nodeType === Node.ELEMENT_NODE &&
      (root as HTMLElement).getAttribute('contenteditable') === 'false'
    ) {
      return null;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    return walker.nextNode() as Text | null;
  };

  const nextEditableSibling = getNextEditableSibling(reviewWrapper.nextSibling);
  const nextTextNode = nextEditableSibling
    ? findFirstTextNode(nextEditableSibling)
    : null;

  if (nextTextNode) {
    nextRange.setStart(nextTextNode, 0);
    nextRange.collapse(true);
  } else {
    // 다음 텍스트 노드가 없으면, 단순히 경계 요소 뒤로 커서를 이동시킵니다.
    // 요소들이 contentEditable=false이므로 브라우저가 알아서 그 뒤에 입력을 처리합니다.
    let target = reviewWrapper as Node;
    const nextEl = reviewWrapper.nextElementSibling as HTMLElement | null;
    if (nextEl?.hasAttribute('data-review-boundary')) {
      target = nextEl;
      if (nextEl.nextElementSibling?.hasAttribute('data-review-tail')) {
        target = nextEl.nextElementSibling as HTMLElement;
      }
    }
    const anchor = ensureEditableTextAnchorAfter(target);
    if (!anchor) {
      return false;
    }
    nextRange.setStart(anchor, 0);
    nextRange.collapse(true);
  }

  selection.removeAllRanges();
  selection.addRange(nextRange);
  return true;
};
