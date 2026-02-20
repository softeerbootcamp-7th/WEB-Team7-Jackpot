import {
  type CoverLetterType,
  type CreateCoverLetterRequest,
} from '@/shared/types/coverLetter';

export const mapServerDataToFormData = (
  serverData: CoverLetterType,
): CreateCoverLetterRequest => {
  return {
    companyName: serverData.companyName,
    jobPosition: serverData.jobPosition,
    applyYear: serverData.applyYear,
    applyHalf: serverData.applyHalf,
    deadline: serverData.deadline,
    questions:
      serverData.questions?.map((q) => ({
        question: q.question,
        category: q.category,
      })) || [],
  };
};

export const convertFormDataToRequest = (
  formData: FormData,
): CreateCoverLetterRequest => {
  // 1. FormData에서 가져온 값들을 안전하게 string으로 변환
  const rawContents = formData.getAll('questionContents');
  const rawTypes = formData.getAll('questionTypes');

  // 2-a. 방법 1: string만 필터링 (더 엄격한 방식)
  const contents = rawContents.filter(
    (item): item is string => typeof item === 'string',
  );
  const types = rawTypes.filter(
    (item): item is string => typeof item === 'string',
  );

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
      formData.get('applyHalf') === 'SECOND_HALF'
        ? 'SECOND_HALF'
        : 'FIRST_HALF',
    deadline: (formData.get('deadline') as string) ?? '',
    questions: questions,
  };
};

export const createRecruitPath = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `/recruit/${year}/${month}`;
};
