import type {
  CreateCoverLetterRequest, // 폼에서 사용하는 요청 타입
} from '@/features/recruit/types';

/**
 * 서버 데이터를 폼 데이터 구조로 변환합니다.
 * - 불필요한 필드(id, createdAt 등)를 제거하고
 * - 폼 UI가 기대하는 형태로 가공합니다.
 */
export const mapServerDataToFormData = (
  serverData: CreateCoverLetterRequest,
): CreateCoverLetterRequest => {
  return {
    companyName: serverData.companyName,
    jobPosition: serverData.jobPosition,
    applyYear: serverData.applyYear,
    applyHalf: serverData.applyHalf,
    deadline: serverData.deadline,

    // 질문 배열 매핑:
    // 서버 데이터에는 id가 있을 수 있지만,
    // 생성/수정 요청 폼 데이터(Request)에는 보통 내용과 카테고리만 필요합니다.
    questions:
      serverData.questions !== undefined
        ? serverData.questions.map((q) => ({
            question: q.question,
            category: q.category,
          }))
        : [],
  };
};

export const convertFormDataToRequest = (
  formData: FormData,
): CreateCoverLetterRequest => {
  // 1. 같은 name을 가진 값들을 배열로 가져옴
  const contents = formData.getAll('questionContents') as string[];
  const types = formData.getAll('questionTypes') as string[];

  // 2. 두 배열(내용, 유형)을 합쳐서 객체 배열로 변환
  const questions = contents.map((content, index) => ({
    question: content,
    category: types[index] || '기본 문항', // 유형이 없으면 기본값 처리
    // limitLength 등 필요한 필드 추가
  }));

  // 3. 최종 객체 반환
  return {
    companyName: (formData.get('companyName') as string) ?? '',
    jobPosition: (formData.get('jobPosition') as string) ?? '',
    applyYear: Number(formData.get('applyYear')) || new Date().getFullYear(),
    applyHalf:
      (formData.get('applyHalf') as 'FIRST_HALF' | 'SECOND_HALF') ??
      'FIRST_HALF',
    deadline: (formData.get('deadline') as string) ?? '',
    questions: questions,
  };
};

export const createRecruitPath = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `/recruit/${year}/${month}`;
};
