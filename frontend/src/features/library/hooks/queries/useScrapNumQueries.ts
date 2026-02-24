import { useQuery } from '@tanstack/react-query';

import { fetchScrapNum } from '@/features/library/api';
import { scrapNumKeys } from '@/shared/hooks/queries/scrapKeys';

export const useScrapNumQueries = () => {
  return useQuery({
    queryKey: scrapNumKeys.all,
    queryFn: () => fetchScrapNum(),
    staleTime: 0, // 즉시 stale 상태로 설정하여 invalidation 후 빠른 갱신
  });
};
