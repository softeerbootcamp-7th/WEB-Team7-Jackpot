import type { Review } from '@/shared/types/review';

export const parseTaggedText = (raw: string) => {
  const openTagRegex = /<c(\d+)>/g;
  const closeTagRegex = /<\/c(\d+)>/g;

  const tags: Array<{
    id: string;
    type: 'open' | 'close';
    position: number;
    matchLength: number;
  }> = [];

  // 여는 태그 수집
  let match: RegExpExecArray | null;
  while ((match = openTagRegex.exec(raw)) !== null) {
    tags.push({
      id: match[1],
      type: 'open',
      position: match.index,
      matchLength: match[0].length,
    });
  }

  // 닫는 태그 수집
  while ((match = closeTagRegex.exec(raw)) !== null) {
    tags.push({
      id: match[1],
      type: 'close',
      position: match.index,
      matchLength: match[0].length,
    });
  }

  // 위치순 정렬
  tags.sort((a, b) => a.position - b.position);

  // 태그 제거하면서 실제 텍스트 위치 계산
  const taggedRanges: Array<{ id: string; start: number; end: number }> = [];
  const stack: Array<{ id: string; start: number }> = [];

  let cleaned = '';
  let lastIndex = 0;

  for (const tag of tags) {
    // 태그 이전의 텍스트 추가
    cleaned += raw.slice(lastIndex, tag.position);

    if (tag.type === 'open') {
      // 여는 태그: 스택에 추가
      stack.push({ id: tag.id, start: cleaned.length });
    } else {
      // 닫는 태그: 스택에서 매칭되는 여는 태그 찾기
      const openIndex = stack.findIndex((t) => t.id === tag.id);

      if (openIndex !== -1) {
        const open = stack[openIndex];
        taggedRanges.push({
          id: tag.id,
          start: open.start,
          end: cleaned.length,
        });
        stack.splice(openIndex, 1);
      } else {
        console.warn(`Closing tag </c${tag.id}> without matching opening tag`);
      }
    }

    lastIndex = tag.position + tag.matchLength;
  }

  // 남은 텍스트 추가
  cleaned += raw.slice(lastIndex);

  // 매칭되지 않은 여는 태그 경고
  if (stack.length > 0) {
    console.warn(
      'Unclosed tags:',
      stack.map((t) => t.id),
    );
  }

  return { cleaned, taggedRanges };
};

// TODO: 자신이 작성한 리뷰인지 여부도 함께 처리 필요
export const buildReviewsFromApi = (
  cleanedText: string,
  taggedRanges: Array<{ id: string; start: number; end: number }>,
  apiReviews: Array<{
    id: number;
    sender: { id: string; nickname: string };
    originText: string;
    suggest: string | null;
    comment: string;
    createdAt: string;
  }>,
) => {
  return apiReviews.map((api) => {
    const tagged = taggedRanges.find((t) => t.id === String(api.id));

    if (!tagged) {
      return {
        id: String(api.id),
        selectedText: api.originText,
        revision: api.suggest || '',
        comment: api.comment,
        range: { start: -1, end: -1 },
        sender: api.sender,
        originText: api.originText,
        suggest: api.suggest,
        createdAt: api.createdAt,
        isValid: false,
      } as Review;
    }

    const actualText = cleanedText.slice(tagged.start, tagged.end);
    const isTextMatching = actualText === api.originText;

    return {
      id: String(api.id),
      selectedText: api.originText,
      revision: api.suggest || '',
      comment: api.comment,
      range: { start: tagged.start, end: tagged.end },
      sender: api.sender,
      originText: api.originText,
      suggest: api.suggest,
      createdAt: api.createdAt,
      isValid: isTextMatching,
    } as Review;
  });
};

let internalReviewAutoId = 1000;
export const generateInternalReviewId = () => String(++internalReviewAutoId);

// 두 문자열을 비교하여 변경된 위치와 길이를 계산
export const calculateTextChange = (
  oldText: string,
  newText: string,
): { changeStart: number; oldLength: number; newLength: number } => {
  // 앞에서부터 같은 부분 찾기
  let changeStart = 0;
  while (
    changeStart < oldText.length &&
    changeStart < newText.length &&
    oldText[changeStart] === newText[changeStart]
  ) {
    changeStart++;
  }

  // 뒤에서부터 같은 부분 찾기
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
    oldLength: oldEnd - changeStart,
    newLength: newEnd - changeStart,
  };
};

// 텍스트 변경에 따라 리뷰 범위를 업데이트하고, 겹침을 감지하여 무효화
export const updateReviewRanges = <T extends Review>(
  reviews: T[],
  changeStart: number,
  oldLength: number,
  newLength: number,
): T[] => {
  const lengthDiff = newLength - oldLength;
  const changeEnd = changeStart + oldLength;

  const shiftedReviews = reviews.map((review): T => {
    const { start, end } = review.range;

    if (end <= changeStart) return review;
    if (start >= changeEnd) {
      return {
        ...review,
        range: { start: start + lengthDiff, end: end + lengthDiff },
      };
    }

    // 1-3. 변경 범위에 리뷰가 완전히 포함되는 경우
    // 순수 삭제(newLength === 0)뿐만 아니라 텍스트가 대체되는 경우에도
    // 기존 리뷰의 원본 텍스트(originText)가 유실되었으므로 무효화합니다.
    if (start >= changeStart && end <= changeEnd) {
      return {
        ...review,
        range: { start: -1, end: -1 },
        isValid: false,
      };
    }

    // 1-4. 변경 범위와 부분적으로 겹치는 경우 (경계 보정)
    let newStart = start;
    let newEnd = end;

    if (start >= changeStart && start < changeEnd) {
      // 리뷰의 시작점이 변경 영역 내부인 경우
      newStart = changeStart + newLength; // 변경된 텍스트 이후로 밀어냄
      newEnd = end + lengthDiff;
    } else if (end > changeStart && end <= changeEnd) {
      // 리뷰의 끝점이 변경 영역 내부인 경우
      newEnd = changeStart;
    } else if (start < changeStart && end > changeEnd) {
      // 리뷰가 변경 영역을 통째로 포함하는 경우
      newEnd = end + lengthDiff;
    }

    return {
      ...review,
      range: {
        start: newStart,
        end: Math.max(newStart, newEnd),
      },
    };
  });

  // [Step 2] 겹침 검증
  // 시작점 기준으로 정렬하여 앞 리뷰의 끝점이 뒤 리뷰의 시작점보다 큰지 확인
  const activeReviews = [...shiftedReviews]
    .filter((r) => r.range.start !== -1 && r.isValid !== false)
    .sort((a, b) => a.range.start - b.range.start);

  const conflictIds = new Set<string>();
  let lastEnd = -1;

  for (const r of activeReviews) {
    if (r.range.start < lastEnd) {
      conflictIds.add(r.id);
    } else {
      lastEnd = r.range.end;
    }
  }

  // 겹친 리뷰 무효화 처리하여 반환
  return shiftedReviews.map((r) =>
    conflictIds.has(r.id) ? { ...r, isValid: false } : r,
  );
};

// 편집된 텍스트와 리뷰 범위 정보를 받아서 태그가 포함된 원본 형식으로 재구성
export const reconstructTaggedText = (
  cleanedText: string,
  reviews: Review[],
): string => {
  // 1. 유효한 리뷰 필터링 및 오름차순 정렬
  const validReviews = reviews.filter(
    (r) =>
      r.isValid !== false &&
      r.range.start !== -1 &&
      r.range.start < r.range.end &&
      r.range.end <= cleanedText.length,
  );

  const sorted = [...validReviews].sort(
    (a, b) => a.range.start - b.range.start,
  );

  let result = '';
  let lastIndex = 0;

  for (const review of sorted) {
    const { start, end } = review.range;

    // 2. 최종 겹침 방어 (앞 리뷰가 점유한 영역을 침범하면 스킵)
    if (start < lastIndex) {
      console.warn(`Collision skipped: Review ${review.id}`);
      continue;
    }

    // 텍스트 조립: 이전 텍스트 + 여는 태그 + 내용 + 닫는 태그
    result += cleanedText.slice(lastIndex, start);
    result += `<c${review.id}>${cleanedText.slice(start, end)}</c${review.id}>`;

    lastIndex = end;
  }

  // 3. 남은 텍스트 추가
  result += cleanedText.slice(lastIndex);

  return result;
};
