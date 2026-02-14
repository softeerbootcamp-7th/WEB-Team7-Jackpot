export const coverLetterKeys = {
  // 1. 최상위 키 (모든 자소서 관련 쿼리의 부모)
  all: ['coverLetters'] as const,

  // 2. 달력 조회용 키 (필터 포함)
  calendar: (filters: { startDate: string; endDate: string }) =>
    [...coverLetterKeys.all, 'calendar', filters] as const,

  // 3. 자기소개서 단건 조회용 키 (ID 포함)
  detail: (coverLetterId: number) =>
    [...coverLetterKeys.all, 'detail', coverLetterId] as const,
};
