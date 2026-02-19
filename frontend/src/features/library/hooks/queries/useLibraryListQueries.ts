import {
  type InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import { fetchDocumentList, fetchFolderList } from '@/features/library/api';
import { libraryKeys } from '@/features/library/hooks/queries/keys';
import {
  type CoverLetterListResponse,
  type LibraryView,
  type QuestionListResponse,
} from '@/features/library/types';
import { getQnA } from '@/shared/api/qnaApi';
import type { QnA } from '@/shared/types/qna';

export const useLibraryListQueries = (type: LibraryView) => {
  return useQuery({
    queryKey: libraryKeys.lists(type),
    queryFn: () => fetchFolderList(type),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    select: (data) => {
      return {
        folderList: data.libraries,
      };
    },
    placeholderData: keepPreviousData,
  });
};

// 1. Company (자기소개서) List Query
export const useCompanyListQueries = (folderId: string | null) => {
  return useInfiniteQuery<
    CoverLetterListResponse, // TQueryFnData: API가 반환하는 데이터
    Error, // TError
    InfiniteData<CoverLetterListResponse>, // TData: 무한 스크롤 데이터 구조
    readonly unknown[], // TQueryKey: 키 타입
    number | undefined // TPageParam: 커서 타입 (첫 요청은 undefined)
  >({
    queryKey: libraryKeys.list('COMPANY', folderId ?? ''),

    queryFn: ({ pageParam }) => {
      return fetchDocumentList(
        'COMPANY',
        folderId ?? '',
        pageParam, // undefined면 첫 페이지(API에서 처리됨)
      ) as Promise<CoverLetterListResponse>;
    },

    // 초기 커서값 (첫 페이지)
    initialPageParam: undefined,

    getNextPageParam: (lastPage) => {
      // 1. 더 이상 페이지가 없으면 종료
      if (!lastPage.hasNext) {
        return undefined;
      }

      // 2. 마지막 아이템의 ID를 다음 커서로 사용
      // 빈 배열일 경우를 대비해 optional chaining (?.) 사용
      const lastItem = lastPage.coverLetters?.at(-1);

      return lastItem?.id;
    },

    // folderId가 없으면 쿼리를 실행하지 않음 (선택 사항)
    enabled: !!folderId,
  });
};

// 2. QnA (질문) List Query
export const useQnAListQueries = (folderId: string | null) => {
  return useInfiniteQuery<
    QuestionListResponse,
    Error,
    InfiniteData<QuestionListResponse>,
    readonly unknown[],
    number | undefined
  >({
    queryKey: libraryKeys.list('QUESTION', folderId ?? ''),

    queryFn: ({ pageParam }) => {
      return fetchDocumentList(
        'QUESTION',
        folderId ?? '',
        pageParam,
      ) as Promise<QuestionListResponse>;
    },

    initialPageParam: undefined,

    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) {
        return undefined;
      }

      // qnAs 배열 안전하게 접근
      const lastItem = lastPage.qnAs?.at(-1);

      return lastItem?.id;
    },

    enabled: !!folderId,
  });
};

// 2. QnAId로 단건 상세 조회 가져오기 (현재 페이지 내용)
export const useQnAQuery = (qnaId: number | null) => {
  return useQuery<QnA>({
    queryKey: ['qna', qnaId],
    queryFn: () => getQnA(qnaId!),
    enabled: !!qnaId,
    staleTime: 1000 * 60 * 5, // 5분간 캐싱
  });
};
