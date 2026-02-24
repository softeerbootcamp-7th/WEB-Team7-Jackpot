// 추가 고려사항: qnA의 분리해야 합니다.
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

// 1. 도메인 특화 타입 정의
interface QnAPage {
  qnAs: Array<{ qnAId: number; [key: string]: unknown }>;
}

// 2. 사용자 정의 타입 가드 (Type Guard)
// 이 함수가 true를 반환하면, TypeScript는 해당 데이터가 QnAPage 타입임을 확신합니다.
const isQnAPage = (data: unknown): data is QnAPage => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'qnAs' in data &&
    Array.isArray((data as QnAPage).qnAs)
  );
};

interface UseInfiniteSearchProps<T> {
  queryKey?: string;
  fetchAction?: (keyword: string, lastId?: number) => Promise<T>;
  isEnabled?: boolean;
  mergeData?: (prev: T, next: T) => T;
  getLastId?: (data: T) => number | undefined;
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
  mergeData,
  getLastId,
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
        if (isMounted && result) {
          setData(result);

          // T extends { hasNext?: boolean } 이므로 any 없이 안전하게 접근 가능
          setHasNextPage(result.hasNext ?? false);

          // 3. 타입 가드를 활용한 안전한 접근
          if (getLastId) {
            setLastId(getLastId(result));
          } else if (isQnAPage(result)) {
            // 이제 TypeScript는 result가 qnAs 배열을 가지고 있음을 '알고' 있습니다.
            const lastItem = result.qnAs.at(-1);
            setLastId(lastItem?.qnAId);
          } else {
            setLastId(undefined);
          }
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
  }, [currentQueryParam, isEnabled, getLastId]); // 의존성 배열에 getLastId 추가

  // 다음 페이지 로드
  const fetchNextPage = useCallback(async () => {
    if (!currentQueryParam || !fetchActionRef.current || !hasNextPage) return;

    setIsFetchingNextPage(true);

    try {
      const nextData = await fetchActionRef.current(currentQueryParam, lastId);
      if (nextData) {
        setData((prevData) => {
          if (!prevData) return nextData;
          if (mergeData) return mergeData(prevData, nextData);

          // 4. 타입 가드를 활용한 안전한 병합
          if (isQnAPage(prevData) && isQnAPage(nextData)) {
            return {
              ...nextData,
              qnAs: [...prevData.qnAs, ...nextData.qnAs],
            } as unknown as T;
            // TS 한계 극복: spread 연산자로 만든 새 객체가 제네릭 T를 완벽히
            // 만족하는지 TS가 추론하지 못하므로, 안전하게 구조를 맞춘 후 타입 단언을 합니다.
          }
          return nextData;
        });

        setHasNextPage(nextData.hasNext ?? false);

        // 5. 다음 페이지 커서 설정
        const nextCursor = getLastId
          ? getLastId(nextData)
          : isQnAPage(nextData)
            ? nextData.qnAs.at(-1)?.qnAId
            : undefined;

        setLastId(nextCursor);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [currentQueryParam, lastId, hasNextPage, mergeData, getLastId]);

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
