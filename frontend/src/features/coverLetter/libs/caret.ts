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

// caret 복원
export const restoreCaret = (el: HTMLElement, offset: number) => {
  const sel = window.getSelection();
  if (!sel) return;

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
      const zwspCount = (nodeText.match(/\u200B/g) || []).length;
      const actualLength = nodeText.length - zwspCount;

      if (remaining <= actualLength) {
        let realOffset = 0;
        let virtualCount = 0;
        while (virtualCount < remaining && realOffset < nodeText.length) {
          if (nodeText[realOffset] !== '\u200B') virtualCount++;
          realOffset++;
        }
        const range = document.createRange();
        range.setStart(node, realOffset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= actualLength;
    }
  }
};
