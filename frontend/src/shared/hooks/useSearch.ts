import { type ChangeEvent, useCallback, useEffect, useState } from 'react';

import { useSearchParams } from 'react-router';

import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { validateSearchKeyword } from '@/shared/utils/validation';

interface UseSearchProps {
  queryKey?: string;
  pageKey?: string;
  mode?: 'pagination' | 'infinite';
  storageKey?: string;
  activeCondition?: boolean;
}

export const useSearch = ({
  queryKey = 'keyword',
  pageKey = 'page',
  mode = 'infinite',
  storageKey,
  activeCondition = true,
}: UseSearchProps = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToastMessageContext();
  const isPagination = mode === 'pagination';

  // 1. 현재 URL 파라미터와 로컬 스토리지 값을 동기적으로 확인
  const currentQueryParam = searchParams.get(queryKey) || '';
  const savedKeyword =
    activeCondition && storageKey ? localStorage.getItem(storageKey) || '' : '';

  // 현재 페이지 파라미터 추출
  const currentPageParam = isPagination
    ? parseInt(searchParams.get(pageKey) || '1', 10)
    : undefined;

  // 로컬 스토리지에는 검색어가 있는데, URL에는 아직 없는 상태인가?
  const isSyncingUrl =
    activeCondition &&
    savedKeyword !== '' &&
    currentQueryParam !== savedKeyword;

  // 2. 검색어 상태 초기화
  const [keyword, setKeyword] = useState(() => {
    if (!activeCondition) return '';
    if (savedKeyword) return savedKeyword;
    return currentQueryParam;
  });

  // 3. 탭 전환 감지 및 렌더링 중 상태 덮어쓰기
  const [prevActiveCondition, setPrevActiveCondition] =
    useState(activeCondition);
  const [prevStorageKey, setPrevStorageKey] = useState(storageKey);

  if (
    activeCondition !== prevActiveCondition ||
    storageKey !== prevStorageKey
  ) {
    setPrevActiveCondition(activeCondition);
    setPrevStorageKey(storageKey);
    setKeyword(savedKeyword);
  }

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  // 4. 로컬 스토리지 즉시 삭제 및 추가 파라미터 지원
  const handleClear = useCallback(() => {
    setKeyword('');

    // 즉시 로컬 스토리지에서 삭제하여 무한 로딩(isSyncingUrl = true) 방지
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(queryKey);
        if (isPagination) next.delete(pageKey);

        return next;
      },
      { replace: true },
    );
  }, [queryKey, pageKey, isPagination, setSearchParams, storageKey]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (!isPagination) return;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(pageKey, newPage.toString());
        return next;
      });
    },
    [isPagination, pageKey, setSearchParams],
  );

  // 5. 외부 시스템(URL, 스토리지) 동기화 Effect (Calling effect 제거됨)
  useEffect(() => {
    if (!activeCondition) {
      setSearchParams(
        (prev) => {
          if (!prev.has(queryKey)) return prev;
          const next = new URLSearchParams(prev);
          next.delete(queryKey);
          if (isPagination) next.delete(pageKey);
          return next;
        },
        { replace: true },
      );
      return;
    }

    const timer = setTimeout(() => {
      const trimmedKeyword = keyword.trim();

      if (trimmedKeyword !== '') {
        const { isValid, message } = validateSearchKeyword(trimmedKeyword);
        if (!isValid && message) {
          showToast(message);
          return;
        }
      }

      // 로컬 스토리지 동기화
      if (storageKey) {
        if (trimmedKeyword) localStorage.setItem(storageKey, trimmedKeyword);
        else localStorage.removeItem(storageKey);
      }

      // URL 동기화
      if (currentQueryParam !== trimmedKeyword) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (trimmedKeyword) {
              next.set(queryKey, trimmedKeyword);
              if (isPagination) next.set(pageKey, '1');
            } else {
              next.delete(queryKey);
              if (isPagination) next.delete(pageKey);
            }
            return next;
          },
          { replace: true },
        );
      }
    }, 300);

    return () => clearTimeout(timer);
    // searchParams를 의존성 배열에 포함하면 불필요한 이펙트 재실행이 발생할 수 있기에 삭제하였습니다.
  }, [
    keyword,
    activeCondition,
    storageKey,
    queryKey,
    pageKey,
    isPagination,
    currentQueryParam,
    setSearchParams,
    showToast,
  ]);

  return {
    page: currentPageParam,
    handlePageChange,
    keyword,
    handleChange,
    currentQueryParam,
    isInitializing: isSyncingUrl,
    handleClear,
  };
};
