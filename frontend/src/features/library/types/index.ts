export type LibraryView = 'COMPANY' | 'QUESTIONS';

// types/library.ts
export interface LibraryResponse {
  libraries: string[];
}

// types/coverLetter.ts
export interface CoverLetter {
  id: number;
  applySeason: string;
  companyName: string;
  jobPosition: string;
  questionCount: number;
  modifiedAt: string; // ISO 8601 format 권장
}

export interface CoverLetterListResponse {
  coverLetters: CoverLetter[];
  hasNext: boolean;
}

// types/question.ts
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
