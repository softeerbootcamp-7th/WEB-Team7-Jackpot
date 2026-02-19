export type LibraryView = 'COMPANY' | 'QUESTION';

export interface LibraryResponse {
  libraries: string[];
}

export interface CoverLetterItem {
  id: number;
  applySeason?: string;
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

export interface QuestionItem {
  id: number;
  companyName: string;
  jobPosition: string;
  applySeason: string; // "2024 상반기" 형식
  question: string;
  answer: string | null;
  coverLetterId: number;
}

export interface QuestionListResponse {
  questionCategory: string;
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
  qnAs: QuestionItem[];
  hasNext: boolean;
}
