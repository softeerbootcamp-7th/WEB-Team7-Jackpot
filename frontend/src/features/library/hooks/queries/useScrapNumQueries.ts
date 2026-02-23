import { useQuery } from '@tanstack/react-query';

import { fetchScrapNum } from '@/features/library/api';
import { scrapNumKeys } from '@/shared/hooks/queries/scrapKeys';

export const useScrapNumQueries = () => {
  return useQuery({
    queryKey: scrapNumKeys.all,
    queryFn: () => fetchScrapNum(),
  });
};
