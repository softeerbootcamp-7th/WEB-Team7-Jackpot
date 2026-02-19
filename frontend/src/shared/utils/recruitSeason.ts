import type { ApiApplyHalf, ApplyHalf } from '@/shared/types/coverLetter';

export const mapApplyHalf = (api: ApiApplyHalf | undefined): ApplyHalf =>
  api === 'FIRST_HALF' ? '상반기' : '하반기';
