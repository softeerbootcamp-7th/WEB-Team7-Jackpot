import { apiClient } from '@/shared/api/apiClient';

// 회사 및 직무 목록 조회
export const getCompaniesApi = () =>
  apiClient.get<string[]>({ endpoint: '/coverletter/companies/all' });

export const getJobPositionsApi = () =>
  apiClient.get<string[]>({ endpoint: '/coverletter/job-positions/all' });
