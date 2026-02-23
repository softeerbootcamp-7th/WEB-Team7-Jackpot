import type { Review, ReviewViewStatus } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';
import { calculateTextChangeLengths } from '@/shared/utils/textDiff';

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
    if (matchesSuggest) return 'ACCEPTED';
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
  return calculateTextChangeLengths(oldText, newText);
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

  // 텍스트 일치 여부(origin/suggest)는 range 비활성화 기준으로 쓰지 않는다.
  // range는 "태그가 달린 위치" 추적 기준으로 유지하고, 상태 표시는 applyViewStatus에서 계산한다.
  const validatedReviews = shiftedReviews.map((review) => {
    const { start, end } = review.range;
    if (start < 0 || end < 0 || start >= end)
      return { ...review, range: { start: -1, end: -1 } };
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

  // 변경 영역이 selection을 완전히 포함 → 취소
  if (changeStart <= start && changeEnd >= end) return null;

  // 이하: 부분 겹침 처리
  // spec 2.2: 원문이 모두 삭제된 경우에만 드래그가 풀린다.

  // Case A: change가 selection 내부에서만 발생 (삽입·수정이 선택 범위 안에서만 일어남)
  // start < changeStart && end > changeEnd
  if (start < changeStart && end > changeEnd) {
    const newEnd = end + lengthDiff;
    if (newEnd <= start) return null;
    return {
      ...selection,
      range: { start, end: newEnd },
      selectedText: newText.slice(start, newEnd),
      lineEndIndex: selection.lineEndIndex + lengthDiff,
    };
  }

  // Case B: change가 selection 뒤쪽 경계와 겹침 (start < changeStart < end ≤ changeEnd)
  // → selection을 changeStart까지 축소
  if (start < changeStart) {
    const newEnd = changeStart;
    return {
      ...selection,
      range: { start, end: newEnd },
      selectedText: newText.slice(start, newEnd),
      lineEndIndex: Math.max(newEnd, selection.lineEndIndex + lengthDiff),
    };
  }

  // Case C: change가 selection 앞쪽 경계와 겹침 (changeStart ≤ start < changeEnd < end)
  // → selection 시작을 change 끝으로 이동
  const newStart = changeStart + newLength;
  const newEnd = end + lengthDiff;
  if (newEnd <= newStart) return null;
  return {
    ...selection,
    range: { start: newStart, end: newEnd },
    selectedText: newText.slice(newStart, newEnd),
    lineEndIndex: Math.max(newStart, selection.lineEndIndex + lengthDiff),
  };
};

// 편집된 텍스트와 리뷰 범위를 받아 태그 포함 원본으로 재구성
export const reconstructTaggedText = (
  cleanedText: string,
  reviews: Review[],
): string => {
  // 유효한 리뷰 필터링 (range가 추적 가능한 모든 리뷰 포함)
  // viewStatus는 프론트엔드가 계산하는 값이며, 서버 본문은 상태에 관계없이 모든 태그를 포함한다.
  // OUTDATED 리뷰는 range.start === -1 이므로 아래 조건으로 자연히 제외된다.
  const validReviews = reviews.filter(
    (r) =>
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

const CLOSE_TAG = '⟦/r⟧';

interface MapCleanRangeOptions {
  insertionBias?: 'before' | 'after';
  removeWholeReviewIds?: number[];
}

const toTaggedIndex = (
  taggedText: string,
  cleanIndex: number,
  options?: { skipLeadingTags?: boolean },
): number => {
  const boundedCleanIndex = Math.max(0, cleanIndex);
  let rawIndex = 0;
  let cleanCount = 0;

  while (rawIndex < taggedText.length && cleanCount < boundedCleanIndex) {
    if (taggedText.startsWith('⟦r:', rawIndex)) {
      const closeBracketIndex = taggedText.indexOf('⟧', rawIndex);
      rawIndex =
        closeBracketIndex === -1 ? taggedText.length : closeBracketIndex + 1;
      continue;
    }
    if (taggedText.startsWith(CLOSE_TAG, rawIndex)) {
      rawIndex += CLOSE_TAG.length;
      continue;
    }
    rawIndex += 1;
    cleanCount += 1;
  }

  if (options?.skipLeadingTags ?? true) {
    // 루프 종료 후 현재 위치의 태그를 건너뜀.
    // rawIndex가 태그 경계를 가리키는 경우 실제 문자 위치로 이동한다.
    while (rawIndex < taggedText.length) {
      if (taggedText.startsWith('⟦r:', rawIndex)) {
        const closeBracketIndex = taggedText.indexOf('⟧', rawIndex);
        rawIndex =
          closeBracketIndex === -1 ? taggedText.length : closeBracketIndex + 1;
        continue;
      }
      if (taggedText.startsWith(CLOSE_TAG, rawIndex)) {
        rawIndex += CLOSE_TAG.length;
        continue;
      }
      break;
    }
  }

  return rawIndex;
};

const advanceTaggedIndexByCleanLength = (
  taggedText: string,
  rawStart: number,
  cleanLength: number,
): number => {
  let rawIndex = Math.max(0, rawStart);
  let remaining = Math.max(0, cleanLength);

  while (rawIndex < taggedText.length && remaining > 0) {
    if (taggedText.startsWith('⟦r:', rawIndex)) {
      const closeBracketIndex = taggedText.indexOf('⟧', rawIndex);
      rawIndex =
        closeBracketIndex === -1 ? taggedText.length : closeBracketIndex + 1;
      continue;
    }
    if (taggedText.startsWith(CLOSE_TAG, rawIndex)) {
      rawIndex += CLOSE_TAG.length;
      continue;
    }
    rawIndex += 1;
    remaining -= 1;
  }

  return rawIndex;
};

const findTagSpanContaining = (
  taggedText: string,
  rawIndex: number,
): { start: number; end: number } | null => {
  if (rawIndex < 0 || rawIndex > taggedText.length) return null;

  const openStart = taggedText.lastIndexOf('⟦r:', rawIndex);
  if (openStart !== -1) {
    const openEndBracket = taggedText.indexOf('⟧', openStart);
    if (openEndBracket !== -1) {
      const openEnd = openEndBracket + 1;
      if (rawIndex > openStart && rawIndex < openEnd) {
        return { start: openStart, end: openEnd };
      }
    }
  }

  const closeStart = taggedText.lastIndexOf(CLOSE_TAG, rawIndex);
  if (closeStart !== -1) {
    const closeEnd = closeStart + CLOSE_TAG.length;
    if (rawIndex > closeStart && rawIndex < closeEnd) {
      return { start: closeStart, end: closeEnd };
    }
  }

  return null;
};

export const mapCleanRangeToTaggedRange = (
  cleanedText: string,
  reviews: Review[],
  range: { start: number; end: number },
  options?: MapCleanRangeOptions,
) => {
  const taggedText = reconstructTaggedText(cleanedText, reviews);
  const start = Math.max(0, range.start);
  const end = Math.min(cleanedText.length, Math.max(start, range.end));

  let startIdx = toTaggedIndex(taggedText, start);
  let endIdx = startIdx;

  // 순수 삽입(start === end)이고 cursor가 ⟦/r⟧ 바로 앞에 있으면 close tag 이후로 이동.
  // updateReviewRanges의 `end <= changeStart` 처리와 일관성을 유지하여
  // "리뷰 바로 뒤 삽입"이 서버에서도 리뷰 외부(태그 뒤)에 적용되도록 보장한다.
  if (start === end) {
    if (options?.insertionBias === 'before') {
      startIdx = toTaggedIndex(taggedText, start, { skipLeadingTags: false });
    } else {
      while (taggedText.startsWith(CLOSE_TAG, startIdx)) {
        startIdx += CLOSE_TAG.length;
      }
    }
    endIdx = startIdx;
  } else {
    // 삭제/치환은 clean 문자 길이만큼만 전진시켜 태그가 범위에 포함되지 않도록 한다.
    endIdx = advanceTaggedIndexByCleanLength(taggedText, startIdx, end - start);

    if ((options?.removeWholeReviewIds?.length ?? 0) > 0) {
      const removeIds = new Set(options?.removeWholeReviewIds ?? []);
      for (const review of reviews) {
        if (!removeIds.has(review.id)) continue;
        if (review.range.start < 0 || review.range.end <= review.range.start)
          continue;
        // 이번 변경 범위가 해당 리뷰 텍스트를 건드렸을 때만 태그 전체 제거
        const overlaps =
          Math.max(start, review.range.start) < Math.min(end, review.range.end);
        if (!overlaps) continue;

        const reviewRawStart = toTaggedIndex(taggedText, review.range.start, {
          skipLeadingTags: false,
        });
        const reviewRawEnd = toTaggedIndex(taggedText, review.range.end);
        let reviewRawCloseEnd = reviewRawEnd;
        while (taggedText.startsWith(CLOSE_TAG, reviewRawCloseEnd)) {
          reviewRawCloseEnd += CLOSE_TAG.length;
        }
        startIdx = Math.min(startIdx, reviewRawStart);
        endIdx = Math.max(endIdx, reviewRawCloseEnd);
      }
    }
  }

  // 일반 편집에서는 태그 토큰 내부를 부분 삭제/부분 치환하지 않도록 경계를 정규화한다.
  // (토큰 전체 제거는 removeWholeReviewIds 분기에서만 허용)
  const startTagSpan = findTagSpanContaining(taggedText, startIdx);
  if (startTagSpan) startIdx = startTagSpan.end;
  const endTagSpan = findTagSpanContaining(taggedText, endIdx);
  if (endTagSpan) endIdx = endTagSpan.start;
  if (endIdx < startIdx) endIdx = startIdx;

  return { startIdx, endIdx };
};
