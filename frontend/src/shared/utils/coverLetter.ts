import type { CoverLetterQuestion } from '@/shared/types/coverLetter';

// 모든 질문의 question과 category가 비어있지 않은지 확인
export const isQuestionsValid = (questions: CoverLetterQuestion[]) => {
  return (
    questions.length > 0 &&
    questions.every((q) => q.question.trim() !== '' && q.category.trim() !== '')
  );
};
