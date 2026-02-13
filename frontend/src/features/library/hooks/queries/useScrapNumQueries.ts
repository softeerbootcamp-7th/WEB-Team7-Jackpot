import { useQuery } from '@tanstack/react-query';

import { fetchScrapNum } from '@/features/library/api';
import { scrapNumKeys } from '@/features/library/hooks/queries/keys';

export const useScrapNumQueries = () => {
  return useQuery({
    queryKey: scrapNumKeys.all,
    queryFn: () => fetchScrapNum(),
  });
};
