import { z } from 'zod';

import type {
  CoverLetterListResponse,
  CreateScrapRequest,
  CreateScrapResponse,
  LibraryResponse,
  LibraryView,
  QnASearchResponse,
  QuestionListResponse,
  ScrapCount,
} from '@/features/library/types';
import { apiClient } from '@/shared/api/apiClient';

const LibraryResponseSchema = z.object({
  libraries: z.array(z.string()),
});

// 자소서(CoverLetter) 관련 스키마
const CoverLetterSchema = z.object({
  id: z.number(),
  applySeason: z.string(),
  companyName: z.string(),
  jobPosition: z.string(),
  questionCount: z.number(),
  modifiedAt: z.string(),
});

const CoverLetterListResponseSchema = z.object({
  coverLetters: z.array(CoverLetterSchema),
  hasNext: z.boolean(),
});

// 질문(Question) 아이템 스키마
const QuestionItemSchema = z.object({
  id: z.number(),
  companyName: z.string(),
  jobPosition: z.string(),
  applySeason: z.string(),
  question: z.string(),
  answer: z.string().nullable(),
  coverLetterId: z.number(),
});

// 질문 목록 응답 스키마
const QuestionListResponseSchema = z.object({
  questionCategory: z.string(),
  qnAs: z.array(QuestionItemSchema),
  hasNext: z.boolean(),
});

const ScrapCountSchema = z.object({
  scrapCount: z.number(),
});

const CreateScrapRequestSchema = z.object({
  qnAId: z.number(),
});

const CreateScrapResponseSchema = z.object({
  qnAId: z.number(),
  scrapCount: z.number(),
});

// 검색 전체 스키마
export const SearchQnASchema = z.object({
  id: z.number(),
  companyName: z.string(),
  jobPosition: z.string(),
  applySeason: z.string(),
  question: z.string(),
  answer: z.string().nullable(),
  coverLetterId: z.number(),
});

//  검색 응답 스키마
export const SearchLibraryResponseSchema = z.object({
  libraryCount: z.number(),
  libraries: z.array(z.string()),
  qnACount: z.number(),
  qnAs: z.array(SearchQnASchema),
  hasNext: z.boolean(), // 추가된 필드
});

/**
 * 라이브러리(폴더) 목록 조회
 */
export const fetchFolderList = async (
  libraryType: LibraryView,
): Promise<LibraryResponse> => {
  const queryParams = new URLSearchParams({ libraryType }).toString();

  const response = await apiClient.get({
    endpoint: `/library/all?${queryParams}`,
  });

  return LibraryResponseSchema.parse(response);
};

/**
 * 특정 폴더 내 문서(자소서/질문) 목록 조회
 */
export const fetchDocumentList = async (
  libraryType: LibraryView,
  folderName: string,
  lastId?: number,
  size = 5,
): Promise<CoverLetterListResponse | QuestionListResponse> => {
  const params = new URLSearchParams({
    size: String(size),
  });

  // lastId가 유효한 경우에만 파라미터 추가
  if (lastId !== undefined && lastId !== null) {
    if (libraryType === 'COMPANY') {
      params.append('lastCoverLetterId', String(lastId));
    } else {
      params.append('lastQuestionId', String(lastId));
    }
  }

  // COMPANY (자소서) 조회
  if (libraryType === 'COMPANY') {
    params.append('companyName', folderName);

    const response = await apiClient.get({
      endpoint: `/library/company/all&${params.toString()}`,
    });

    return CoverLetterListResponseSchema.parse(response);
  }

  // QUESTION (질문) 조회
  else {
    params.append('questionCategory', folderName);

    const response = await apiClient.get({
      endpoint: `/library/question/all&${params.toString()}`,
    });

    //  변경된 스키마로 파싱
    return QuestionListResponseSchema.parse(response);
  }
};

/**
 * 통합 검색 (라이브러리 + 질문)
 */
export const searchLibrary = async (
  searchWord: string,
  lastQnAId?: number,
  size = 10,
): Promise<QnASearchResponse> => {
  const params = new URLSearchParams({
    searchWord,
    size: String(size),
  });

  if (lastQnAId !== undefined && lastQnAId !== null) {
    params.append('lastQnAId', String(lastQnAId));
  }

  const response = await apiClient.get({
    endpoint: `/search/library?${params.toString()}`,
  });

  return SearchLibraryResponseSchema.parse(response);
};

/**
 * 스크랩 개수 조회
 */
export const fetchScrapNum = async (): Promise<ScrapCount> => {
  const response = await apiClient.get({
    endpoint: `/scraps/count`,
  });

  return ScrapCountSchema.parse(response);
};

/**
 * 스크랩 생성
 */
export const createScrap = async (
  payload: CreateScrapRequest,
): Promise<CreateScrapResponse> => {
  // 요청 데이터 검증
  const validatedPayload = CreateScrapRequestSchema.parse(payload);

  const response = await apiClient.post({
    endpoint: '/scraps',
    body: validatedPayload, // 검증된 데이터를 보냅니다.
  });

  // 응답 데이터 검증 및 반환
  return CreateScrapResponseSchema.parse(response);
};

/**
 * 스크랩 삭제
 */
export const deleteScrap = async (scrapId: number): Promise<void> => {
  return apiClient.delete<void>({
    endpoint: `/scraps/${scrapId}`,
  });
};
