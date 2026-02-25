export const COVERLETTER_QUERY_KEYS = {
  all: ['coverletters'] as const,
  companies: () => [...COVERLETTER_QUERY_KEYS.all, 'companies'] as const,
  jobPositions: () => [...COVERLETTER_QUERY_KEYS.all, 'jobPositions'] as const,
};
