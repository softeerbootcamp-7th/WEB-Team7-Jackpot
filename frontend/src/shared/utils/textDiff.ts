export interface TextDiffRange {
  changeStart: number;
  oldEnd: number;
  newEnd: number;
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

export const buildTextPatch = (oldText: string, newText: string) => {
  const diff = calculateTextDiffRange(oldText, newText);
  return {
    startIdx: diff.changeStart,
    endIdx: diff.oldEnd,
    replacedText: newText.slice(diff.changeStart, diff.newEnd),
  };
};
