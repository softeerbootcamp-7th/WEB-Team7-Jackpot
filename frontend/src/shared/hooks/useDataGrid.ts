import { useMemo } from 'react';

import { generateDateGrid } from '@/shared/utils/dates';

export const useDataGrid = (startDate: Date, endDate: Date) => {
  const days = useMemo(() => {
    return generateDateGrid(startDate, endDate);
  }, [startDate, endDate]);

  return days;
};
