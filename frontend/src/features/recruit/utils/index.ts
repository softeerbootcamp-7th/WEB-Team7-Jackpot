import type { QnAListResponse } from '@/features/recruit/types';
import { type CoverLetterType } from '@/shared/types/coverLetter';

// 타입을 먼저 정의합니다 (기존 타입을 재활용하거나 새로 정의)
interface CombinedCoverLetter {
  coverLetter: CoverLetterType;
  questions: QnAListResponse['qnAs'];
}

/**
 * 서버에서 받은 자기소개서 기본 정보와 문항 리스트를
 * 하나의 폼 데이터 구조로 결합하는 유틸 함수입니다.
 */
export const combineCoverLetterData = (
  coverLetterData: CoverLetterType,
  qnaData: QnAListResponse,
): CombinedCoverLetter => {
  return {
    coverLetter: {
      coverLetterId: coverLetterData.coverLetterId,
      companyName: coverLetterData.companyName,
      applyYear: coverLetterData.applyYear,
      applyHalf: coverLetterData.applyHalf,
      jobPosition: coverLetterData.jobPosition,
      deadline: coverLetterData.deadline,
    },
    // qnAs 배열을 questions라는 이름으로 매핑
    questions: qnaData.qnAs.map((q) => ({
      qnAId: q.qnAId,
      question: q.question,
      category: q.category,
    })),
  };
};

export const createRecruitPath = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `/recruit/${year}/${month}`;
};
