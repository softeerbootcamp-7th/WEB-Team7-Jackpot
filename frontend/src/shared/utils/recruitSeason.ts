import type { ApiApplyHalf, ApplyHalf } from '@/shared/types/coverLetter';

export const mapApplyHalf = (api: ApiApplyHalf): ApplyHalf =>
  api === 'FIRST_HALF' ? '상반기' : '하반기';
