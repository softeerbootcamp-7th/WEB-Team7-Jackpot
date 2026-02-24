import type { LibraryView } from '@/shared/types/library';

// 라이브러리에 필요한 키 팩토리 정의
export const libraryKeys = {
  all: ['libraries'] as const,

  // 문항 라이브러리 혹은 기업 라이브러리 리스트
  lists: (type: LibraryView) => [...libraryKeys.all, 'lists', type] as const,

  // 폴더를 누른 경우 (기업 혹은 문항)
  list: (type: LibraryView, folderId: string) =>
    [...libraryKeys.lists(type), folderId] as const,

  // 전체 상세 페이지 갱신
  details: () => [...libraryKeys.all, 'detail'] as const,

  // 특정 문항 혹은 자기소개서의 상세 페이지
  detail: (documentId: number) =>
    [...libraryKeys.details(), documentId] as const,
};
