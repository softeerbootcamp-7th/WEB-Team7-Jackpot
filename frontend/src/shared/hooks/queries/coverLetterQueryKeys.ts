export const coverLetterQueryKeys = {
  // 1. 최상위 키
  all: ['coverLetters'] as const,

  // 2. 달력 조회용 키
  calendar: (filters: { startDate: string; endDate: string }) =>
    [...coverLetterQueryKeys.all, 'calendar', filters] as const,

  // 3. 자기소개서 단건 조회용 키
  detail: (coverLetterId: number) =>
    [...coverLetterQueryKeys.all, 'detail', coverLetterId] as const,

  // 4. 문항 ID 리스트 조회용 (기존 shared 훅에 있던 키 통일)
  qnaIdList: (coverLetterId: number) =>
    [...coverLetterQueryKeys.detail(coverLetterId), 'qnaIdList'] as const,
};
