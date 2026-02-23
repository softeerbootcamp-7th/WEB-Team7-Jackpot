import { useState } from 'react';

import type { LabeledQnAListResponse } from '@/features/notification/types/notification';

const useEditableQnA = (initialData?: LabeledQnAListResponse) => {
  const [editedData, setEditedData] = useState<
    LabeledQnAListResponse | undefined
  >(initialData);

  // 데이터가 성공적으로 로컬 상태에 들어갔는지 추적하는 플래그
  const [isInitialized, setIsInitialized] = useState(!!initialData);

  if (initialData && !isInitialized) {
    setEditedData(initialData);
    setIsInitialized(true);
  }

  const handleUpdateQnA = (
    tabIndex: number,
    qnaIndex: number,
    field: 'question' | 'answer',
    value: string,
  ) => {
    setEditedData((prev) => {
      if (!prev) return prev;

      // 깊은 복사를 통해 불변성 유지
      const newData = structuredClone(prev);
      newData.coverLetters[tabIndex].qnAs[qnaIndex][field] = value;

      return newData;
    });
  };

  return { editedData, handleUpdateQnA };
};

export default useEditableQnA;
