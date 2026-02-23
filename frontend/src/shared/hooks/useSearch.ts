import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useSearchParams } from 'react-router';

import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { validateSearchKeyword } from '@/shared/utils/validation';

interface UseSearchProps<T> {
  queryKey?: string;
  pageKey?: string;
  fetchAction?: (keyword: string, page: number) => Promise<T>;
  isEnabled?: boolean;
}

export const useSearch = <T>({
  queryKey = 'keyword',
  pageKey = 'page',
  fetchAction,
  isEnabled = true,
}: UseSearchProps<T> = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToastMessageContext();

  const currentQueryParam = searchParams.get(queryKey) || '';
  const currentPageParam = parseInt(searchParams.get(pageKey) || '1', 10);

  const initialKeyword = isEnabled ? currentQueryParam : '';
  const [keyword, setKeyword] = useState(initialKeyword);

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 💡 포인트: fetchAction의 최신 참조를 유지하기 위한 ref
  const fetchActionRef = useRef(fetchAction);

  // fetchAction이 변경될 때마다 ref 값을 최신화합니다.
  // 이 동작은 렌더링에 영향을 주지 않습니다.
  useEffect(() => {
    fetchActionRef.current = fetchAction;
  }, [fetchAction]);

  useEffect(() => {
    if (!isEnabled) {
      setKeyword('');
      return;
    }
    setKeyword((prevKeyword) => {
      if (prevKeyword !== currentQueryParam) {
        return currentQueryParam;
      }
      return prevKeyword;
    });
  }, [currentQueryParam, isEnabled]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(pageKey, newPage.toString());
        return next;
      });
    },
    [pageKey, setSearchParams],
  );

  useEffect(() => {
    if (!isEnabled) return;

    const timer = setTimeout(() => {
      const trimmedKeyword = keyword.trim();

      // 사용자가 검색어를 다 지웠을 때 URL 파라미터 삭제 & 데이터 초기화
      if (trimmedKeyword === '') {
        if (currentQueryParam !== '') {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete(queryKey);
            next.delete(pageKey);
            return next;
          });
        }
        setData(null);
        return;
      }

      const { isValid, message } = validateSearchKeyword(trimmedKeyword);
      // 토스트 메시지 띄우기
      if (!isValid && message) {
        showToast(message);
        return;
      }

      if (currentQueryParam !== trimmedKeyword) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set(queryKey, trimmedKeyword);
          next.set(pageKey, '1');
          return next;
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    keyword,
    currentQueryParam,
    isEnabled,
    pageKey,
    queryKey,
    setSearchParams,
    showToast,
  ]);

  useEffect(() => {
    // 💡 포인트: 의존성 배열에서 fetchAction을 제거하고, fetchActionRef.current를 사용합니다.
    if (!isEnabled || !currentQueryParam || !fetchActionRef.current) {
      setData(null);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // fetchActionRef.current는 존재함이 위에서 보장됨
        const result = await fetchActionRef.current!(
          currentQueryParam,
          currentPageParam,
        );
        if (isMounted) {
          setData(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentQueryParam, currentPageParam, isEnabled]); // 의존성 배열에서 fetchAction 제거됨

  return {
    keyword,
    handleChange,
    data,
    isLoading,
    page: currentPageParam,
    handlePageChange,
    currentQueryParam,
  };
};

export default useSearch;
