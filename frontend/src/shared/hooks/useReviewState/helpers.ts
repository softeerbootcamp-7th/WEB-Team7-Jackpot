import type { Review, ReviewViewStatus } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

// parseTaggedText: 태그 제거 + 위치 계산
export const parseTaggedText = (raw: string) => {
  const openTagRegex = /⟦r:(\d+)⟧/g;
  const closeTagRegex = /⟦\/r⟧/g;

  const tags: Array<{
    id: number;
    type: 'open' | 'close';
    position: number;
    matchLength: number;
  }> = [];

  // 여는 태그
  let match: RegExpExecArray | null;
  while ((match = openTagRegex.exec(raw)) !== null) {
    tags.push({
      id: Number(match[1]),
      type: 'open',
      position: match.index,
      matchLength: match[0].length,
    });
  }

  // 닫는 태그 (⟦/r⟧에는 ID가 없으므로 id는 파싱 시 스택에서 결정)
  while ((match = closeTagRegex.exec(raw)) !== null) {
    tags.push({
      id: -1,
      type: 'close',
      position: match.index,
      matchLength: match[0].length,
    });
  }

  // 위치순 정렬
  tags.sort((a, b) => a.position - b.position);

  const taggedRanges: Array<{ id: number; start: number; end: number }> = [];
  const stack: Array<{ id: number; start: number }> = [];

  let cleaned = '';
  let lastIndex = 0;

  for (const tag of tags) {
    cleaned += raw.slice(lastIndex, tag.position);

    if (tag.type === 'open') {
      stack.push({ id: tag.id, start: cleaned.length });
    } else {
      // ⟦/r⟧는 ID가 없으므로 가장 최근에 열린 태그를 닫음 (스택 pop)
      const open = stack.pop();
      if (open) {
        taggedRanges.push({
          id: open.id,
          start: open.start,
          end: cleaned.length,
        });
      } else {
        console.warn('Closing tag ⟦/r⟧ without matching opening tag');
      }
    }

    lastIndex = tag.position + tag.matchLength;
  }

  cleaned += raw.slice(lastIndex);

  if (stack.length > 0) {
    console.warn(
      'Unclosed tags:',
      stack.map((t) => t.id),
    );
  }

  return { cleaned, taggedRanges };
};

// 리뷰의 현재 뷰 상태를 계산
export const computeViewStatus = (
  review: Review,
  currentText: string,
): ReviewViewStatus => {
  const { start, end } = review.range;
  if (start < 0 || end < 0 || start >= end) return 'OUTDATED';

  const textAtRange = currentText.slice(start, end);
  const matchesOrigin = textAtRange === review.originText;
  const hasSuggest = review.suggest != null && review.suggest.length > 0;
  const matchesSuggest = hasSuggest && textAtRange === review.suggest;

  if (review.isApproved) {
    if (matchesOrigin) return 'ACCEPTED';
    if (matchesSuggest) return 'PENDING_CHANGED';
    return 'OUTDATED';
  }

  if (matchesOrigin) return 'PENDING';
  if (matchesSuggest) return 'ACCEPTED';
  return 'PENDING_CHANGED';
};

// 리뷰 배열에 viewStatus를 일괄 계산하여 반영
export const applyViewStatus = <T extends Review>(
  reviews: T[],
  currentText: string,
): T[] => {
  return reviews.map((r) => ({
    ...r,
    viewStatus: computeViewStatus(r, currentText),
  }));
};

// buildReviewsFromApi: API 리뷰 -> 내부 Review
export const buildReviewsFromApi = (
  cleanedText: string,
  taggedRanges: Array<{ id: number; start: number; end: number }>,
  apiReviews: Array<{
    id: number;
    sender: { id: string; nickname: string };
    originText: string;
    suggest: string | null;
    comment: string;
    createdAt: string;
    isApproved: boolean;
  }>,
): Review[] => {
  const reviews = apiReviews.map((api) => {
    const tagged = taggedRanges.find((t) => t.id === api.id);

    if (!tagged) {
      return {
        id: api.id,
        originText: api.originText,
        comment: api.comment,
        range: { start: -1, end: -1 },
        sender: api.sender,
        suggest: api.suggest,
        createdAt: api.createdAt,
        isApproved: api.isApproved,
      };
    }

    return {
      id: api.id,
      originText: api.originText,
      comment: api.comment,
      range: { start: tagged.start, end: tagged.end },
      sender: api.sender,
      suggest: api.suggest,
      createdAt: api.createdAt,
      isApproved: api.isApproved,
    };
  });

  return applyViewStatus(reviews, cleanedText);
};

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

// 텍스트 변경에 따라 리뷰 범위를 업데이트하고 겹침 감지
export const updateReviewRanges = <T extends Review>(
  reviews: T[],
  changeStart: number,
  oldLength: number,
  newLength: number,
  newDocumentText: string,
): T[] => {
  const lengthDiff = newLength - oldLength;
  const changeEnd = changeStart + oldLength;

  const shiftedReviews = reviews.map((review): T => {
    const { start, end } = review.range;

    // 변경 영역과 겹치지 않는 리뷰는 위치만 이동
    if (end <= changeStart) return review;
    if (start >= changeEnd) {
      return {
        ...review,
        range: { start: start + lengthDiff, end: end + lengthDiff },
      };
    }

    // 변경 영역에 리뷰가 완전히 포함되는 경우:
    // - 변경 범위와 리뷰 범위가 정확히 일치하면(첨삭 적용 케이스) 새 길이에 맞춰 범위를 유지
    // - 그 외에는 기존대로 무효화
    if (start >= changeStart && end <= changeEnd) {
      if (start === changeStart && end === changeEnd) {
        return {
          ...review,
          range: { start: changeStart, end: changeStart + newLength },
        };
      }
      return {
        ...review,
        range: { start: -1, end: -1 },
      };
    }

    // 부분 겹침 처리
    let newStart = start;
    let newEnd = end;

    if (start >= changeStart && start < changeEnd) {
      newStart = changeStart + newLength;
      newEnd = end + lengthDiff;
    } else if (end > changeStart && end <= changeEnd) {
      newEnd = changeStart;
    } else if (start < changeStart && end > changeEnd) {
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

  // 리뷰 기준 텍스트 검증. 불일치 리뷰는 range를 비활성화한다.
  const validatedReviews = shiftedReviews.map((review) => {
    const { start, end } = review.range;
    if (start < 0 || end < 0)
      return { ...review, range: { start: -1, end: -1 } };

    const currentText = newDocumentText.slice(start, end);
    const expectedText = review.isApproved
      ? (review.suggest ?? review.originText)
      : review.originText;
    if (currentText !== expectedText) {
      return { ...review, range: { start: -1, end: -1 } };
    }
    return review;
  });

  // 겹침 검증
  const activeReviews = validatedReviews
    .filter((r) => r.range.start !== -1)
    .sort((a, b) => a.range.start - b.range.start);

  const conflictIds = new Set<number>();
  let lastEnd = -1;

  for (const r of activeReviews) {
    if (r.range.start < lastEnd) {
      conflictIds.add(r.id);
      lastEnd = Math.max(lastEnd, r.range.end);
    } else {
      lastEnd = r.range.end;
    }
  }

  // 겹친 리뷰 무효화
  const finalReviews = validatedReviews.map((r) =>
    conflictIds.has(r.id) ? { ...r, range: { start: -1, end: -1 } } : r,
  );

  // viewStatus 재계산
  return applyViewStatus(finalReviews, newDocumentText);
};

// 텍스트 변경에 따라 selection 범위를 업데이트
// TODO: websocket 연결 시 서버에서 전달하는 OT operation을 직접 적용하는 방식으로 교체 고려
export const updateSelectionForTextChange = (
  selection: SelectionInfo,
  changeStart: number,
  oldLength: number,
  newLength: number,
  newText: string,
): SelectionInfo | null => {
  const lengthDiff = newLength - oldLength;
  const changeEnd = changeStart + oldLength;
  const { start, end } = selection.range;

  // 변경 이전 영역 → 그대로
  if (end <= changeStart) return selection;

  // 변경 이후 영역 → shift
  if (start >= changeEnd) {
    const newStart = start + lengthDiff;
    const newEnd = end + lengthDiff;
    return {
      ...selection,
      range: { start: newStart, end: newEnd },
      selectedText: newText.slice(newStart, newEnd),
      lineEndIndex: selection.lineEndIndex + lengthDiff,
    };
  }

  // 변경 영역에 selection이 완전히 포함 → 취소
  if (start >= changeStart && end <= changeEnd) {
    return null;
  }

  // 부분 겹침 → 안전하게 취소
  // TODO: OT 시스템 도입 후 부분 겹침 시에도 유효한 범위를 유지하는 로직 추가 가능
  return null;
};

// 편집된 텍스트와 리뷰 범위를 받아 태그 포함 원본으로 재구성
export const reconstructTaggedText = (
  cleanedText: string,
  reviews: Review[],
): string => {
  // 유효한 리뷰 필터링
  const validReviews = reviews.filter(
    (r) =>
      r.range.start !== -1 &&
      r.range.start < r.range.end &&
      r.range.end <= cleanedText.length &&
      (r.viewStatus === 'PENDING' || r.viewStatus === 'ACCEPTED'),
  );

  const sorted = [...validReviews].sort(
    (a, b) => a.range.start - b.range.start,
  );

  let result = '';
  let lastIndex = 0;

  for (const review of sorted) {
    const { start, end } = review.range;

    // 이전 리뷰 영역과 겹치면 스킵
    if (start < lastIndex) {
      console.warn(`Collision skipped: Review ${review.id}`);
      continue;
    }

    // 텍스트 조립
    result += cleanedText.slice(lastIndex, start);
    result += `⟦r:${review.id}⟧${cleanedText.slice(start, end)}⟦/r⟧`;

    lastIndex = end;
  }

  result += cleanedText.slice(lastIndex);
  return result;
};
