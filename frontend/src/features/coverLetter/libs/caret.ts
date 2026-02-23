// caret 저장
export const saveCaret = (el: HTMLElement): number => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString().length;
};

/**
 * Node의 자식을 순회하며 텍스트를 추출 (BR → \n, zwsp 제거).
 * HTMLElement, DocumentFragment 등 어떤 Node든 사용할 수 있다.
 */
export const collectText = (root: Node): string => {
  let result = '';
  const walk = (node: Node) => {
    if (node.nodeName === 'BR') {
      result += '\n';
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || '';
      return;
    }
    node.childNodes.forEach(walk);
  };
  root.childNodes.forEach(walk);
  return result.replace(/[\u200B\u2060]/g, '');
};

/**
 * DOM 구조에 의존하지 않는 커서 위치 계산.
 * Range.cloneContents()로 컨테이너 시작~커서까지의 내용을 복사해 텍스트 길이를 센다.
 * 한글 IME 조합 중 브라우저가 만드는 임시 span 등에 영향받지 않는다.
 */
export const getCaretPosition = (
  container: HTMLElement,
): { start: number; end: number } => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return { start: 0, end: 0 };

  const range = sel.getRangeAt(0);
  if (
    !container.contains(range.startContainer) ||
    !container.contains(range.endContainer)
  )
    return { start: 0, end: 0 };

  const countOffset = (endContainer: Node, endOffset: number): number => {
    const tempRange = document.createRange();
    tempRange.selectNodeContents(container);
    tempRange.setEnd(endContainer, endOffset);
    return collectText(tempRange.cloneContents()).length;
  };

  const start = countOffset(range.startContainer, range.startOffset);
  const end = range.collapsed
    ? start
    : countOffset(range.endContainer, range.endOffset);

  return { start, end };
};

// caret 복원
export const restoreCaret = (el: HTMLElement, offset: number) => {
  const sel = window.getSelection();
  if (!sel) return;

  const findReviewWrapper = (node: Node): HTMLElement | null => {
    let current: Node | null = node;
    while (current && current !== el) {
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

  const walker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
  );
  let remaining = offset;

  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeName === 'BR') {
      if (remaining === 0) {
        const range = document.createRange();
        range.setStartBefore(node);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= 1;
      continue;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.textContent || '';
      const hiddenCount = (nodeText.match(/[\u200B\u2060]/g) || []).length;
      const actualLength = nodeText.length - hiddenCount;

      if (remaining <= actualLength) {
        let realOffset = 0;
        let virtualCount = 0;
        while (virtualCount < remaining && realOffset < nodeText.length) {
          if (nodeText[realOffset] !== '\u200B' && nodeText[realOffset] !== '\u2060') {
            virtualCount++;
          }
          realOffset++;
        }
        const range = document.createRange();
        // 리뷰 텍스트의 끝 경계에 캐럿이 걸리면 브라우저가 다음 입력을
        // 리뷰 span 내부로 붙이는 경우가 있어, 경계에서는 wrapper 바깥으로 이동시킨다.
        if (remaining === actualLength) {
          const reviewWrapper = findReviewWrapper(node);
          if (reviewWrapper) {
            range.setStartAfter(reviewWrapper);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }
        }
        range.setStart(node, realOffset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= actualLength;
    }
  }

  // fallback: offset이 전체 텍스트 길이를 초과하면 마지막 위치에 캐럿 배치
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false); // 끝으로 이동
  sel.removeAllRanges();
  sel.addRange(range);
};
