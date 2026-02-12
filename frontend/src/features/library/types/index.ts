export type LibraryView = 'COMPANY' | 'QUESTION';

export interface LibraryResponse {
  libraries: string[];
}

export interface CoverLetterQnA {
  qnaId: number;
  question: string;
  answer: string;
  answerSize: number;
  modifiedAt: string;
}

export interface CoverLetter {
  id: number;
  applySeason: string;
  companyName: string;
  jobPosition: string;
  questionCount: number;
  modifiedAt: string; // ISO 8601 format 권장
  question: CoverLetterQnA[]; // 복수형입니다.
}

export type DocumentListResponse =
  | CoverLetterListResponse
  | QuestionListResponse;

export interface CoverLetterListResponse {
  coverLetters: CoverLetter[];
  hasNext: boolean;
}

export interface QuestionItem {
  id: number;
  companyName: string;
  jobPosition: string;
  applySeason: string;
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
