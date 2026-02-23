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
import { CATEGORY_VALUES } from '@/shared/constants/createCoverLetter';

// 상수를 활용하여 Zod enum 생성 (단일 진실 공급원 유지)
const CategoryEnum = z.enum(CATEGORY_VALUES);

const LibraryResponseSchema = z.object({
  libraries: z.array(z.string()),
});

// 자소서(CoverLetter) 관련 스키마
const CoverLetterSchema = z.object({
  id: z.number(),
  applySeason: z.string().nullable(), // ✨ 타입 인터페이스(string | null)에 맞게 nullable 추가
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
  applySeason: z.string().nullable(),
  question: z.string(),
  answer: z.string().nullable(),
  coverLetterId: z.number(),
});

// 질문 목록 응답 스키마
const QuestionListResponseSchema = z.object({
  // ✨ questionCategory -> questionCategoryType 으로 이름 변경 및 안전장치 추가
  questionCategoryType: CategoryEnum.nullable().catch(null),
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

// 검색용 QnA 아이템 스키마
const QnAsSearchSchema = z.object({
  qnAId: z.number(),
  companyName: z.string(),
  jobPosition: z.string(),
  applySeason: z.string().nullable(),
  question: z.string(),
  answer: z.string().nullable(),
  coverLetterId: z.number(),
  questionCategoryType: CategoryEnum.nullable().catch(null),
});

// 검색 응답 스키마
export const SearchLibraryResponseSchema = z.object({
  libraryCount: z.number(),
  libraries: z.array(z.string()),
  qnACount: z.number(),
  qnAs: z.array(QnAsSearchSchema),
  hasNext: z.boolean(),
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

  if (lastId !== undefined && lastId !== null) {
    if (libraryType === 'COMPANY') {
      params.append('lastCoverLetterId', String(lastId));
    } else {
      params.append('lastQuestionId', String(lastId));
    }
  }

  if (libraryType === 'COMPANY') {
    params.append('companyName', folderName);

    const response = await apiClient.get({
      endpoint: `/library/company/all?${params.toString()}`,
    });

    return CoverLetterListResponseSchema.parse(response);
  } else {
    // 💡 백엔드 파라미터가 그대로 questionCategory 라면 유지, 만약 이것도 바뀌었다면 맞춰서 수정해야 함
    params.append('questionCategory', folderName);

    const response = await apiClient.get({
      endpoint: `/library/question/all?${params.toString()}`,
    });

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
  const validatedPayload = CreateScrapRequestSchema.parse(payload);

  const response = await apiClient.post({
    endpoint: '/scraps',
    body: validatedPayload,
  });

  return CreateScrapResponseSchema.parse(response);
};
