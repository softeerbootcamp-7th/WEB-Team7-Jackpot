import type { CoverLetterQuestion } from '@/shared/types/coverLetter';

// 모든 질문의 question과 category가 비어있지 않은지 확인
// [박소민] TODO: category가 Category 타입인지 확인하는 로직 넣기. 어떻게 할 지 처리
export const isQuestionsValid = (questions: CoverLetterQuestion[]) => {
  return (
    questions.length > 0 &&
    questions.every((q) => q.question.trim() !== '' && q.category.trim() !== '')
  );
};
