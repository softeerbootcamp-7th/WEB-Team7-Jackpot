import { useState } from 'react';

import type {
  ContentItemType,
  ContentStateType,
} from '@/features/upload/types/upload';
import { halfInfo } from '@/features/upload/utils/generateAboutDate';

const useCoverLetterState = () => {
  const [contents, setContents] = useState<ContentStateType>(
    [1, 2, 3].reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          companyName: '',
          jobPosition: '',
          recruitPeriod: {
            year: 2026,
            season: halfInfo,
          },
          questionType: '',
        },
      }),
      {},
    ),
  );

  const updateContents = (
    key: number,
    field: keyof ContentItemType | 'year' | 'season',
    value: string | number,
  ) => {
    setContents((prev) => {
      const currentItem = prev[key];

      if (field === 'year' || field === 'season') {
        return {
          ...prev,
          [key]: {
            ...currentItem,
            recruitPeriod: {
              ...currentItem.recruitPeriod,
              [field]: value,
            },
          },
        };
      }
      return {
        ...prev,
        [key]: {
          ...currentItem,
          [field]: value,
        },
      };
    });
  };

  return { contents, updateContents };
};

export default useCoverLetterState;
