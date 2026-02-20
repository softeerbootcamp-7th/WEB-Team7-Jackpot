import { useState } from 'react';

const useCoverLetterPagination = (totalPages: number) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const safePageIndex =
    totalPages > 0
      ? Math.max(0, Math.min(currentPageIndex, totalPages - 1))
      : 0;

  return { safePageIndex, setCurrentPageIndex };
};

export default useCoverLetterPagination;
