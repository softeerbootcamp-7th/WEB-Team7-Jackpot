import { useMemo } from 'react';

import { generateDateGrid } from '@/shared/utils/dates';

// [박소민] TODO: timestamp 기반으로 하도록 리팩토링
export const useDataGrid = (startDate: Date, endDate: Date) => {
  const days = useMemo(() => {
    return generateDateGrid(startDate, endDate);
  }, [startDate, endDate]);

  return days;
};
