import type { Category } from '@/shared/types/coverLetter';
import type { LibraryView } from '@/shared/types/library';

export type { LibraryView };

export interface LibraryResponse {
  libraries: string[];
}

export interface CoverLetterItem {
  id: number;
  applySeason: string | null;
  companyName: string;
  jobPosition: string;
  questionCount: number;
  modifiedAt: string; // [박소민] TODO: 타입 유효성 검사
}

export type DocumentListResponse =
  | CoverLetterListResponse
  | QuestionListResponse;

export interface CoverLetterListResponse {
  coverLetters: CoverLetterItem[];
  hasNext: boolean;
}

// [박소민] TODO: 변경된 API에 사용하기에 applySeason optional로 변경, (questionCount 추가)
export interface QuestionItem {
  id: number;
  companyName: string;
  jobPosition: string;
  applySeason: string | null; // "2024 상반기" 형식 (null 허용)
  question: string;
  answer: string | null;
  coverLetterId: number;
}

export interface QuestionListResponse {
  questionCategoryType: Category | null; // 카테고리 선택 안 한 경우 null
  qnAs: QuestionItem[];
  hasNext: boolean;
}

export interface ScrapCount {
  scrapCount: number;
}

export interface CreateScrapRequest {
  qnAId: number;
}

export interface CreateScrapResponse {
  qnAId: number;
  scrapCount: number;
}

export interface QnASearchResponse {
  libraryCount: number;
  libraries: string[];
  qnACount: number;
  qnAs: QnAsSearchResponse[];
  hasNext: boolean;
}

export interface QnAsSearchResponse {
  qnAId: number;
  companyName: string;
  jobPosition: string;
  applySeason: string | null;
  question: string;
  answer: string | null;
  coverLetterId: number;
  questionCategoryType: Category | null;
}
