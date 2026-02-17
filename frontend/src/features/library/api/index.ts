import { z } from 'zod';

import type {
  CoverLetterListResponse,
  CreateScrapRequest,
  CreateScrapResponse,
  LibraryResponse,
  LibraryView,
  QuestionListResponse,
  ScrapCount,
} from '@/features/library/types';
import { apiClient } from '@/shared/api/apiClient';

// 1. Zod Schemas Definition

// QnA Schema
const QnASchema = z.object({
  qnAId: z.number(),
  question: z.string(),
  answer: z.string(),
  answerSize: z.number(),
  modifiedAt: z.string(), // 필요 시 .datetime() 추가 가능
});

// Library Response Schema
const LibraryResponseSchema = z.object({
  libraries: z.array(z.string()),
});

// CoverLetter Schema
const CoverLetterSchema = z.object({
  id: z.number(),
  applySeason: z.string(),
  companyName: z.string(),
  jobPosition: z.string(),
  questionCount: z.number(),
  modifiedAt: z.string(),
  question: z.array(QnASchema), // 인터페이스에 따라 배열로 설정
});

// CoverLetter List Response Schema
const CoverLetterListResponseSchema = z.object({
  coverLetters: z.array(CoverLetterSchema),
  hasNext: z.boolean(),
});

// Question Item Schema
const QuestionItemSchema = z.object({
  id: z.number(),
  companyName: z.string(),
  jobPosition: z.string(),
  applySeason: z.string(),
  question: z.string(),
  answer: z.string(),
});

// Question List Response Schema
const QuestionListResponseSchema = z.object({
  questions: z.array(QuestionItemSchema),
  hasNext: z.boolean(),
});

// Scrap Count Schema
const ScrapCountSchema = z.object({
  scrapCount: z.number(),
});

// Create Scrap Response Schema
const CreateScrapResponseSchema = z.object({
  scrapId: z.number(),
  createdAt: z.string(),
});

// 2. API Functions

export const fetchFolderList = async (
  libraryType: LibraryView,
): Promise<LibraryResponse> => {
  const queryParams = new URLSearchParams({ libraryType }).toString();

  const response = await apiClient.get({
    endpoint: `/library/all?${queryParams}`,
  });

  return LibraryResponseSchema.parse(response);
};

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
    params.append('questionCategoryType', folderName);

    const response = await apiClient.get({
      endpoint: `/library/question/all&${params.toString()}`,
    });

    return QuestionListResponseSchema.parse(response);
  }
};

export const fetchScrapNum = async (): Promise<ScrapCount> => {
  const response = await apiClient.get({
    endpoint: `/scraps/count`,
  });

  return ScrapCountSchema.parse(response);
};

export const createScrap = async (
  payload: CreateScrapRequest,
): Promise<CreateScrapResponse> => {
  const response = await apiClient.post({
    endpoint: '/scraps',
    body: payload,
  });

  return CreateScrapResponseSchema.parse(response);
};

export const deleteScrap = async (scrapId: number): Promise<void> => {
  return apiClient.delete<void>({
    endpoint: `/scraps/${scrapId}`,
  });
};
