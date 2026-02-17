import type { QnA } from '@/shared/types/qna';

export type LibraryView = 'COMPANY' | 'QUESTION';

export interface LibraryResponse {
  libraries: string[];
}

export interface CoverLetter {
  id: number;
  applySeason: string;
  companyName: string;
  jobPosition: string;
  questionCount: number;
  modifiedAt: string; // [박소민] TODO: 타입 유효성 검사
  question: QnA[]; // [박소민] -> QnA 단건 조회 API로 변경 예정
}

export type DocumentListResponse =
  | CoverLetterListResponse
  | QuestionListResponse;

export interface CoverLetterListResponse {
  coverLetters: CoverLetter[];
  hasNext: boolean;
}

// [박소민] TODO: 변경된 API에 맞춰 수정
export interface QuestionItem {
  id: number;
  companyName: string;
  jobPosition: string;
  applySeason: string; // 확인
  question: string;
  answer: string;
}

export interface QuestionListResponse {
  questions: QuestionItem[];
  hasNext: boolean;
}

export interface ScrapCount {
  scrapCount: number;
}

export interface CreateScrapRequest {
  qnAId: number;
}

export interface CreateScrapResponse {
  scrapId: number;
  createdAt: string;
}
