import { useCallback, useState } from 'react';

import { DEFAULT_DATA } from '@/features/recruit/constants';
import type { CreateCoverLetterRequest } from '@/features/recruit/types';

export const useRecruitForm = (initialData?: CreateCoverLetterRequest) => {
  const [formData, setFormData] = useState<CreateCoverLetterRequest>(
    initialData || DEFAULT_DATA,
  );

  const handleChange = useCallback(
    <K extends keyof CreateCoverLetterRequest>(
      key: K,
      value: CreateCoverLetterRequest[K],
    ) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  return { formData, handleChange, setFormData };
};
