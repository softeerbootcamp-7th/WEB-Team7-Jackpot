import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { fetchDocumentList, fetchFolderList } from '@/features/library/api';
import { libraryKeys } from '@/features/library/hooks/queries/keys';
import {
  type CoverLetterListResponse,
  type LibraryView,
  type QuestionListResponse,
} from '@/features/library/types';

export const useLibraryListQueries = (type: LibraryView) => {
  return useQuery({
    queryKey: libraryKeys.lists(type),
    queryFn: () => fetchFolderList(type),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    select: (data) => {
      return {
        folderList: data.libraries,
      };
    },
  });
};

export const useCompanyListQueries = (folderId: string | null) => {
  return useInfiniteQuery<
    CoverLetterListResponse, // TQueryFnData 공부공부공부
    Error, // TError
    CoverLetterListResponse, // TData
    string[], // TQueryKey (queryKey 타입)
    number // TPageParam (페이지 번호)
  >({
    queryKey: [...libraryKeys.list('COMPANY', folderId ?? '')],
    queryFn: ({ pageParam }) =>
      fetchDocumentList(
        'COMPANY',
        folderId ?? '',
        pageParam,
      ) as Promise<CoverLetterListResponse>,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasNext) {
        return undefined;
      }
      return allPages.length;
    },
    enabled: true,
  });
};

export const useQnAListQueries = (folderId: string | null) => {
  return useInfiniteQuery<
    QuestionListResponse, // TQueryFnData
    Error, // TError
    QuestionListResponse, // TData
    string[], // TQueryKey
    number // TPageParam
  >({
    queryKey: [...libraryKeys.list('QUESTION', folderId ?? '')],
    queryFn: ({ pageParam }) =>
      fetchDocumentList(
        'QUESTION',
        folderId ?? '',
        pageParam,
      ) as Promise<QuestionListResponse>,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasNext) {
        return undefined;
      }
      return allPages.length;
    },
    enabled: true,
  });
};
