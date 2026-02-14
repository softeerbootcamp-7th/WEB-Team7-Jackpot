import { useState } from 'react';

import { DEFAULT_DATA } from '@/features/recruit/constants';
import type { CreateCoverLetterRequest } from '@/features/recruit/types';

export const useRecruitForm = (initialData?: CreateCoverLetterRequest) => {
  const [formData, setFormData] = useState<CreateCoverLetterRequest>(
    initialData || DEFAULT_DATA,
  );

  // [박소민] 제너릭 타입을 사용하여 변동되는 타입 보장
  const updateContents = <K extends keyof CreateCoverLetterRequest>(
    key: K,
    value: CreateCoverLetterRequest[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return { formData, updateContents };
};
