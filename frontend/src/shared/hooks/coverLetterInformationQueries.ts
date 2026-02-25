import { useQuery } from '@tanstack/react-query';

import {
  getCompaniesApi,
  getJobPositionsApi,
} from '@/shared/api/coverLetterInformationApi';
import { COVERLETTER_QUERY_KEYS } from '@/shared/hooks/queries/coverLetterInformationKeys';

export const useGetCompanies = () =>
  useQuery({
    queryKey: COVERLETTER_QUERY_KEYS.companies(),
    queryFn: getCompaniesApi,
    staleTime: 1000 * 60 * 60,
  });

export const useGetJobPositions = () =>
  useQuery({
    queryKey: COVERLETTER_QUERY_KEYS.jobPositions(),
    queryFn: getJobPositionsApi,
    staleTime: 1000 * 60 * 60,
  });
