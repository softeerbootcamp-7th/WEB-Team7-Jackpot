import { type ChangeEvent, useEffect, useState } from 'react';

import { useSearchParams } from 'react-router';

import { validateSearchKeyword } from '@/shared/utils/validation';

interface UseSearchProps<T> {
  queryKey?: string;
  fetchAction: (keyword: string) => Promise<T>;
  isEnabled?: boolean;
}

export const useSearch = <T>({
  queryKey = 'keyword',
  fetchAction,
  isEnabled = true,
}: UseSearchProps<T>) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 객체 대신 실제 문자열 값을 변수로 추출
  const currentQueryParam = searchParams.get(queryKey) || '';

  // 1. 초기값 설정
  const initialKeyword = isEnabled ? currentQueryParam : '';
  const [keyword, setKeyword] = useState(initialKeyword);

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. URL 동기화 (외부 변경 감지)
  useEffect(() => {
    if (!isEnabled) {
      setKeyword('');
      return;
    }
    //  의존성에 searchParams 객체가 아닌 문자열 값(currentQueryParam)을 사용
    if (keyword !== currentQueryParam) {
      setKeyword(currentQueryParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQueryParam, isEnabled]); // queryKey는 상수라 생략 가능

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setErrorMessage(null);
  };

  // 3. 디바운싱: 타이핑 -> URL 업데이트
  useEffect(() => {
    if (!isEnabled) return;

    const timer = setTimeout(() => {
      if (keyword.trim() === '') {
        if (currentQueryParam !== '') {
          // 값이 있을 때만 삭제 시도
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete(queryKey);
          setSearchParams(nextParams);
          setData(null);
        }
        return;
      }

      const { isValid, message } = validateSearchKeyword(keyword);
      if (!isValid) {
        setErrorMessage(message);
        return;
      }

      //  현재 URL 값과 다를 때만 업데이트 (중복 호출 방지)
      if (currentQueryParam !== keyword) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set(queryKey, keyword);
        setSearchParams(nextParams);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, currentQueryParam, isEnabled]); // searchParams 제거

  // 4. API 호출
  useEffect(() => {
    if (!isEnabled) {
      setData(null);
      return;
    }

    //  여기서도 문자열 값인 currentQueryParam을 감시
    if (!currentQueryParam) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 이미 가지고 있는 문자열 변수 사용
        const result = await fetchAction(currentQueryParam);
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentQueryParam, fetchAction, isEnabled]); // searchParams 제거

  return { keyword, handleChange, data, isLoading, errorMessage };
};

export default useSearch;
