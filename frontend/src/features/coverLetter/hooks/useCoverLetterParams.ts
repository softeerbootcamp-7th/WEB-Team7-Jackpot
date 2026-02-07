import { useState } from 'react';

import type { CoverLetterView } from '@/features/coverLetter/types';

const useCoverLetterParams = () => {
  const [currentTab, setCurrentTab] =
    useState<CoverLetterView>('COVERLETTER_WRITE');

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null,
  );

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
    },
    actions: {
      handleTabChange,
      setSelectedDocumentId,
      setSelectedFolderId,
    },
  };
};

export default useCoverLetterParams;
