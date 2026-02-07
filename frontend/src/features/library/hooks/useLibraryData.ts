import { useMemo } from 'react';

import {
  MOCK_COVER_LETTERS,
  MOCK_LIBRARIES,
  MOCK_QUESTIONS,
} from '@/features/library/api/mockData';
import type { CoverLetter, LibraryView, QuestionItem } from '@/features/library/types';

type Document = CoverLetter | QuestionItem;

interface UseLibraryDataProps {
  currentTab: LibraryView;
  selectedFolderId: number | null;
  selectedDocumentId: number | null;
}

const useLibraryData = ({
  currentTab,
  selectedDocumentId,
  selectedFolderId,
}: UseLibraryDataProps) => {
  const folderMap = useMemo(() => {
    return {
      COMPANY: MOCK_LIBRARIES.libraries,
      QUESTIONS: MOCK_LIBRARIES.libraries,
    };
  }, []);

  const folderList = folderMap[currentTab];

  const selectedDocumentList = useMemo((): Document[] => {
    if (!selectedFolderId) return [];

    if (currentTab === 'COMPANY') {
      return MOCK_COVER_LETTERS.coverLetters;
    } else {
      return MOCK_QUESTIONS.questions;
    }
  }, [currentTab, selectedFolderId]);

  const selectedDocument = useMemo((): Document | null => {
    if (!selectedDocumentId) return null;

    return (
      MOCK_COVER_LETTERS.coverLetters.find(
        (item) => item.id === selectedDocumentId,
      ) ||
      MOCK_QUESTIONS.questions.find((item) => item.id === selectedDocumentId) ||
      null
    );
  }, [selectedDocumentId]);

  return {
    folderList,
    selectedDocumentList,
    selectedDocument,
  };
};

export default useLibraryData;
