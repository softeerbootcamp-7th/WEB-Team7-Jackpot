import type { InfiniteData } from '@tanstack/react-query';

import type { QnASearchResponse } from '@/features/library/types';
import type { CoverLetterQuestion } from '@/shared/types/coverLetter';

// 모든 질문의 question과 category가 비어있지 않은지 확인
export const isQuestionsValid = (questions: CoverLetterQuestion[]) => {
  return (
    questions.length > 0 &&
    questions.every((q) => q.question.trim() !== '' && q.category.trim() !== '')
  );
};

/**
 * React Query의 InfiniteData를 단일 QnAsSearchResponse 객체로 평탄화(flatten)하는 유틸 함수
 */
export const flattenInfiniteQnAData = (
  data?: InfiniteData<QnASearchResponse>,
): QnASearchResponse => {
  // 데이터가 없거나 로딩 중일 때를 위한 기본값 반환
  if (!data || !data.pages || data.pages.length === 0) {
    return {
      libraryCount: 0,
      libraries: [],
      qnACount: 0,
      qnAs: [],
      hasNext: false,
    };
  }

  return {
    // 1. 첫 번째 페이지의 라이브러리 정보 유지
    libraryCount: data.pages[0]?.libraryCount ?? 0,
    libraries: data.pages[0]?.libraries ?? [],

    // 2. 모든 페이지의 QnA 개수와 배열 누적
    qnACount: data.pages.reduce(
      (total, page) => total + (page.qnACount ?? 0),
      0,
    ),
    qnAs: data.pages.flatMap((page) => page.qnAs ?? []),

    // 3. 마지막 페이지의 hasNext 상태
    hasNext: data.pages.at(-1)?.hasNext ?? false,
  };
};
