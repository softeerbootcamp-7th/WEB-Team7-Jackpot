import type { Category } from '@/shared/types/coverLetter';

export interface QnAListResponse {
  qnAs: {
    qnAId: number;
    question: string;
    category: Category;
  }[];
}
