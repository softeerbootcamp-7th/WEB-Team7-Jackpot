import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import { fetchQnAList } from '@/features/recruit/api';
import {
  fetchFilterCoverLetter,
  getCoverLetter,
} from '@/shared/api/coverLetterApi';
import { getQnAIdList } from '@/shared/api/qnaApi';
import { CATEGORY_VALUES } from '@/shared/constants/createCoverLetter';
import { coverLetterQueryKeys } from '@/shared/hooks/queries/coverLetterKeys';
import type {
  ApiApplyHalf,
  Category,
  FilterRequest,
} from '@/shared/types/coverLetter';

// 1. 달력 조회
export const useInfiniteCalendarDates = (params: FilterRequest) => {
  return useInfiniteQuery({
    queryKey: coverLetterQueryKeys.calendar(params),

    // 초기 커서 값
    initialPageParam: undefined as number | undefined,

    queryFn: ({ pageParam }) => fetchFilterCoverLetter(params, pageParam),

    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) {
        return undefined;
      }
      const lastItem = lastPage.coverLetters.at(-1);
      return lastItem ? lastItem.coverLetterId : undefined;
    },

    placeholderData: keepPreviousData,
    enabled: !!params.startDate && !!params.endDate,
  });
};

// 공고 수정을 위한 질문과 응답 데이터 조회
// 1. 폼 초기값(CreateCoverLetterRequest) 구조와 완전히 동일하게 평탄화된 타입 정의
// 수정 요청 시 필요한 coverLetterId나 qnAId 정도만 추가로 품고 있게 합니다.
export interface RecruitFormViewModel {
  coverLetterId: number;
  companyName: string;
  jobPosition: string;
  applyYear?: number;
  applyHalf?: ApiApplyHalf;
  deadline?: string;
  questions: {
    qnAId: number | null; // 신규 질문은 qnAId가 없으므로 null 허용
    question: string;
    category: Category;
  }[];
}

// 2. 공고 수정을 위한 조회
export const useUpdateRecruit = (coverLetterId: number) => {
  const isValidId =
    !!coverLetterId && !Number.isNaN(coverLetterId) && coverLetterId > 0;

  return useQuery<RecruitFormViewModel>({
    queryKey: ['coverLetterDetailView', coverLetterId],
    queryFn: async () => {
      const [coverLetterRes, qnAIdListRes] = await Promise.all([
        getCoverLetter(coverLetterId),
        getQnAIdList({ coverLetterId }),
      ]);

      let questions: RecruitFormViewModel['questions'] = [];
      if (qnAIdListRes && qnAIdListRes.length > 0) {
        const qnaRes = await fetchQnAList(qnAIdListRes);
        // [박소민] TODO: 리팩토링
        questions = qnaRes.qnAs
          .filter((q) => {
            // ID가 없어도(신규), 질문 내용이나 카테고리가 있으면 유효한 데이터로 간주
            return q.question !== '' || CATEGORY_VALUES.includes(q.category); // ''는 카테고리 선택 안 한 경우의 초기값이므로 유효하지 않음
          })
          .map((q) => ({
            qnAId: q.qnAId ?? null, // undefined인 경우 null로 명시적 변환
            question: q.question ?? '',
            category: q.category as Category,
          }));
      }

      return {
        coverLetterId: coverLetterRes.coverLetterId,
        companyName: coverLetterRes.companyName,
        jobPosition: coverLetterRes.jobPosition,
        applyYear: coverLetterRes.applyYear,
        applyHalf: coverLetterRes.applyHalf,
        deadline: coverLetterRes.deadline,
        questions,
      };
    },
    enabled: isValidId,
  });
};
