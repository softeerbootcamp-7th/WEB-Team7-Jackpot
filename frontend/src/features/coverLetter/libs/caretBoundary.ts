import { collectText } from '@/features/coverLetter/libs/caret';
import type { Review } from '@/shared/types/review';

interface NormalizeCaretAtReviewBoundaryParams {
  contentEl: HTMLDivElement;
  reviews: Review[];
}

const isBoundaryElement = (node: Node | null): node is HTMLElement =>
  Boolean(
    node &&
    node.nodeType === Node.ELEMENT_NODE &&
    ((node as HTMLElement).hasAttribute('data-review-boundary') ||
      (node as HTMLElement).hasAttribute('data-review-tail')),
  );

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

const isReviewGroup = (node: Node | null): node is HTMLElement =>
  Boolean(
    node &&
    node.nodeType === Node.ELEMENT_NODE &&
    (node as HTMLElement).hasAttribute('data-review-group'),
  );

/**
 * 마우스 클릭 이벤트가 리뷰 요소 위에서 발생했는지 판단하고, 해당 reviewId를 반환한다.
 * 리뷰가 아닌 영역 클릭이거나 isReviewActive가 false면 null을 반환한다.
 * React 의존성 없이 순수 DOM 타입만 사용한다.
 */
export const findClickedReviewId = (
  target: EventTarget | null,
  clientX: number,
  clientY: number,
  isReviewActive: boolean,
): number | null => {
  if (!isReviewActive) return null;

  let node = target as Node | null;
  if (node?.nodeType === Node.TEXT_NODE && (node as Text).parentElement) {
    node = (node as Text).parentElement;
  }
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;

  const reviewEl = (node as Element).closest('[data-review-id]');
  const reviewIdStr = reviewEl?.getAttribute('data-review-id');
  if (!reviewIdStr) return null;

  const textSpan = reviewEl?.querySelector('span:not([data-review-id])');
  const checkElement = textSpan || reviewEl;
  if (!checkElement) return null;

  const isDirectlyOverReview = Array.from(checkElement.getClientRects()).some(
    (rect) =>
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom,
  );

  if (!isDirectlyOverReview) return null;

  const reviewId = Number(reviewIdStr);
  return isNaN(reviewId) ? null : reviewId;
};

export const moveCaretIntoAdjacentReview = ({
  contentEl,
  direction,
}: {
  contentEl: HTMLDivElement;
  direction: 'left' | 'right';
}): boolean => {
  const selection = window.getSelection();
  if (!selection || !selection.isCollapsed) return false;

  const range = selection.getRangeAt(0);
  const { startContainer, startOffset } = range;

  // 에디터 외부라면 무시
  if (!contentEl.contains(startContainer)) return false;

  let reviewGroupEl: HTMLElement | null = null;

  // [구조 분석] 인접한 ReviewGroup 찾기
  if (startContainer.nodeType === Node.TEXT_NODE) {
    const textNode = startContainer as Text;
    const parentSpan = textNode.parentElement;

    if (direction === 'right' && startOffset >= textNode.length) {
      const next = parentSpan?.nextSibling ?? null;
      if (isReviewGroup(next)) reviewGroupEl = next as HTMLElement;
    } else if (direction === 'left' && startOffset <= 0) {
      const prev = parentSpan?.previousSibling ?? null;
      if (isReviewGroup(prev)) reviewGroupEl = prev as HTMLElement;
    }
  } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
    const candidate =
      direction === 'right'
        ? (startContainer.childNodes[startOffset] ?? null)
        : (startContainer.childNodes[startOffset - 1] ?? null);

    if (isReviewGroup(candidate)) {
      reviewGroupEl = candidate as HTMLElement;
    }
  }

  if (!reviewGroupEl) return false;

  // 진입 대상: 내부의 contenteditable="true" 인 span
  const editableSpan =
    reviewGroupEl.querySelector<HTMLElement>('[data-review-id]');
  if (!editableSpan) return false;

  const newRange = document.createRange();
  const walker = document.createTreeWalker(editableSpan, NodeFilter.SHOW_TEXT);

  if (direction === 'right') {
    const firstText = walker.nextNode() as Text | null;
    if (firstText) {
      // ㄷㄷㄷㄷ(커서) -> 오른쪽 -> ㄷ(커서)ㄷㅈㄷ... 형태를 위해 offset 1 부여
      // 만약 첫 글자 앞으로 가고 싶다면 0으로 수정
      const offset = Math.min(firstText.length, 1);
      newRange.setStart(firstText, offset);
    } else {
      newRange.setStart(editableSpan, 0);
    }
  } else {
    // 왼쪽 진입 시: 마지막 글자 바로 앞으로 점프
    let lastText: Text | null = null;
    let node: Node | null;
    while ((node = walker.nextNode())) {
      lastText = node as Text;
    }
    if (lastText) {
      const offset = Math.max(0, lastText.length - 1);
      newRange.setStart(lastText, offset);
    } else {
      newRange.setStart(editableSpan, editableSpan.childNodes.length);
    }
  }

  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);

  editableSpan.focus();
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
