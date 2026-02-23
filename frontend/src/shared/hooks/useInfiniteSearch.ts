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

interface UseInfiniteSearchProps<T> {
  queryKey?: string;
  fetchAction?: (keyword: string, lastId?: number) => Promise<T>;
  isEnabled?: boolean;
}

interface InfiniteSearchResult<T> {
  keyword: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  data: T | null;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  currentQueryParam: string;
}

export const useInfiniteSearch = <T extends { hasNext?: boolean }>({
  queryKey = 'keyword',
  fetchAction,
  isEnabled = true,
}: UseInfiniteSearchProps<T> = {}): InfiniteSearchResult<T> => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToastMessageContext();

  const currentQueryParam = searchParams.get(queryKey) || '';
  const initialKeyword = isEnabled ? currentQueryParam : '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastId, setLastId] = useState<number | undefined>();

  const fetchActionRef = useRef(fetchAction);

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

  useEffect(() => {
    if (!isEnabled) return;

    const timer = setTimeout(() => {
      const trimmedKeyword = keyword.trim();

      if (trimmedKeyword === '') {
        if (currentQueryParam !== '') {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete(queryKey);
            return next;
          });
        }
        setData(null);
        setLastId(undefined);
        setHasNextPage(false);
        return;
      }

      const { isValid, message } = validateSearchKeyword(trimmedKeyword);
      if (!isValid && message) {
        showToast(message);
        return;
      }

      if (currentQueryParam !== trimmedKeyword) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set(queryKey, trimmedKeyword);
          return next;
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    keyword,
    currentQueryParam,
    isEnabled,
    queryKey,
    setSearchParams,
    showToast,
  ]);

  // 초기 검색 실행
  useEffect(() => {
    if (!isEnabled || !currentQueryParam || !fetchActionRef.current) {
      setData(null);
      setLastId(undefined);
      setHasNextPage(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchActionRef.current!(currentQueryParam);
        if (isMounted) {
          setData(result);
          setHasNextPage(result?.hasNext ?? false);
          setLastId(undefined);
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
  }, [currentQueryParam, isEnabled]);

  // 다음 페이지 로드
  const fetchNextPage = useCallback(async () => {
    if (!currentQueryParam || !fetchActionRef.current || !hasNextPage) return;

    const isMounted = true;
    setIsFetchingNextPage(true);

    try {
      const nextData = await fetchActionRef.current(currentQueryParam, lastId);
      if (isMounted && nextData) {
        // 이전 데이터와 새 데이터 병합
        setData((prevData) => {
          if (!prevData) return nextData;

          // QnASearchResponse 타입 처리
          if ('qnAs' in prevData && 'qnAs' in nextData) {
            const prevQnAs = prevData.qnAs as unknown[];
            const nextQnAs = nextData.qnAs as unknown[];
            return {
              ...nextData,
              qnAs: [...prevQnAs, ...nextQnAs],
            } as T;
          }

          return nextData;
        });

        setHasNextPage(nextData?.hasNext ?? false);

        // 마지막 아이템의 ID 설정
        if ('qnAs' in nextData && Array.isArray(nextData.qnAs)) {
          const lastItem = nextData.qnAs.at(-1) as Record<string, unknown>;
          if (lastItem?.qnAId) {
            setLastId(lastItem.qnAId as number);
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (isMounted) {
        setIsFetchingNextPage(false);
      }
    }
  }, [currentQueryParam, lastId, hasNextPage]);

  return {
    keyword,
    handleChange,
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    currentQueryParam,
  };
};

export default useInfiniteSearch;
