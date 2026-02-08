import { useState } from 'react';

import type { CoverLetterView } from '@/features/coverLetter/types';

const useCoverLetterParams = () => {
  const [currentTab, setCurrentTab] =
    useState<CoverLetterView>('COVERLETTER_WRITE');

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null,
  );
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const handleTabChange = (tab: CoverLetterView) => {
    setCurrentTab(tab);
    setSelectedFolderId(null);
    setSelectedDocumentId(null);
  };

  return {
    state: {
      currentTab,
      selectedFolderId,
      selectedDocumentId,
      isReviewOpen,
    },
    actions: {
      handleTabChange,
      setSelectedDocumentId,
      setSelectedFolderId,
      openReview: () => setIsReviewOpen(true),
      closeReview: () => setIsReviewOpen(false),
      setIsReviewOpen: (value: boolean) => setIsReviewOpen(value),
    },
  };
};

export default useCoverLetterParams;
