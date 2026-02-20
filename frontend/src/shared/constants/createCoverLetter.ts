import type {
  ApiApplyHalf,
  CreateCoverLetterRequest,
} from '@/shared/types/coverLetter';

export const DEFAULT_APPLY_HALF: ApiApplyHalf = 'FIRST_HALF';

export const DEFAULT_DATA: CreateCoverLetterRequest = {
  companyName: '',
  jobPosition: '',
  applyYear: new Date().getFullYear(),
  applyHalf: DEFAULT_APPLY_HALF,
  deadline: '',
  questions: [{ question: '', category: '' }],
};

export const CATEGORY_VALUES = [
  '지원동기',
  '협업경험',
  '가치관',
  '직무역량',
  '성격의 장단점',
  '입사 후 포부',
  '문제해결',
  '커리어 목표',
  '실패경험',
  '성장과정',
  '사회이슈',
  '기타',
] as const;
