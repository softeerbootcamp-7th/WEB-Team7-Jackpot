import { useCallback, useState } from 'react';

import { DEFAULT_DATA } from '@/shared/constants/createCoverLetter';
import type { CreateCoverLetterRequest } from '@/shared/types/coverLetter';

export const useRecruitForm = (
  initialData: CreateCoverLetterRequest = DEFAULT_DATA,
) => {
  const [formData, setFormData] =
    useState<CreateCoverLetterRequest>(initialData);

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
