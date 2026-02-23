export interface TextDiffRange {
  changeStart: number;
  oldEnd: number;
  newEnd: number;
}

interface BuildTextPatchOptions {
  caretAfter?: number;
}

export const calculateTextDiffRange = (
  oldText: string,
  newText: string,
): TextDiffRange => {
  let changeStart = 0;
  while (
    changeStart < oldText.length &&
    changeStart < newText.length &&
    oldText[changeStart] === newText[changeStart]
  ) {
    changeStart++;
  }

  let oldEnd = oldText.length;
  let newEnd = newText.length;
  while (
    oldEnd > changeStart &&
    newEnd > changeStart &&
    oldText[oldEnd - 1] === newText[newEnd - 1]
  ) {
    oldEnd--;
    newEnd--;
  }

  return {
    changeStart,
    oldEnd,
    newEnd,
  };
};

export const calculateTextChangeLengths = (oldText: string, newText: string) => {
  const diff = calculateTextDiffRange(oldText, newText);
  return {
    changeStart: diff.changeStart,
    oldLength: diff.oldEnd - diff.changeStart,
    newLength: diff.newEnd - diff.changeStart,
  };
};

export const buildTextPatch = (
  oldText: string,
  newText: string,
  options?: BuildTextPatchOptions,
) => {
  const diff = calculateTextDiffRange(oldText, newText);
  let startIdx = diff.changeStart;
  let endIdx = diff.oldEnd;
  let replacedText = newText.slice(diff.changeStart, diff.newEnd);

  const insertedLength = diff.newEnd - diff.changeStart;
  const removedLength = diff.oldEnd - diff.changeStart;
  const caretAfter = options?.caretAfter;

  // 동일 문자가 반복되는 구간에서는 "앞/뒤 삽입"이 모호할 수 있다.
  // pure insertion일 때는 실제 caret 위치를 기준으로 시작 인덱스를 보정한다.
  if (
    typeof caretAfter === 'number' &&
    removedLength === 0 &&
    insertedLength > 0
  ) {
    const boundedCaretAfter = Math.max(0, Math.min(caretAfter, newText.length));
    const candidateStart = boundedCaretAfter - insertedLength;

    if (candidateStart >= 0 && candidateStart <= oldText.length) {
      const candidateReplacedText = newText.slice(
        candidateStart,
        boundedCaretAfter,
      );
      const candidateText =
        oldText.slice(0, candidateStart) +
        candidateReplacedText +
        oldText.slice(candidateStart);

      if (candidateText === newText) {
        startIdx = candidateStart;
        endIdx = candidateStart;
        replacedText = candidateReplacedText;
      }
    }
  }

  return {
    startIdx,
    endIdx,
    replacedText,
  };
};
