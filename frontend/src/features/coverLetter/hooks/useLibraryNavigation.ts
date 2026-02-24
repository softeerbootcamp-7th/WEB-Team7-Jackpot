import { useState } from 'react';

import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';

interface LibraryNavigationState {
  selectedItem: ScrapItem | null;
  selectedLibrary: string | null;
}

/**
 * useLibraryNavigation 훅
 *
 * 라이브러리 검색 결과에서의 네비게이션 상태를 통합 관리합니다.
 * - selectedItem: 선택된 문항 (상세보기 표시)
 * - selectedLibrary: 선택된 폴더 (리스트 표시)
 *
 * 동작:
 * 1. 검색 결과에서 폴더 선택 → selectedLibrary 설정
 * 2. 폴더 내 문항 선택 → selectedItem 설정 (selectedLibrary 유지)
 * 3. 문항 상세보기에서 뒤로가기 → selectedItem 초기화
 * 4. 폴더 리스트에서 뒤로가기 → selectedLibrary 초기화
 */
export const useLibraryNavigation = () => {
  const [state, setState] = useState<LibraryNavigationState>({
    selectedItem: null,
    selectedLibrary: null,
  });

  const selectLibrary = (libraryName: string) => {
    setState({
      selectedItem: null,
      selectedLibrary: libraryName,
    });
  };

  const selectItem = (item: ScrapItem) => {
    setState((prev) => ({
      ...prev,
      selectedItem: item,
    }));
  };

  const goBackToLibraryList = () => {
    setState((prev) => ({
      ...prev,
      selectedItem: null,
    }));
  };

  const goBackToSearchResult = () => {
    setState({
      selectedItem: null,
      selectedLibrary: null,
    });
  };

  return {
    selectedItem: state.selectedItem,
    selectedLibrary: state.selectedLibrary,
    selectLibrary,
    selectItem,
    goBackToLibraryList,
    goBackToSearchResult,
  };
};
