import { type ChangeEvent, useEffect, useState } from 'react';

interface UseSearchProps {
  onSearch: (keyword: string) => void;
}

const useSearch = ({ onSearch }: UseSearchProps) => {
  const [keyword, setKeyword] = useState('');
  const [debounceKeyword, setDebounceKeyword] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    setKeyword(newKeyword);

    if (keyword.trim().length >= 2) {
      onSearch(keyword);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceKeyword(keyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    onSearch(debounceKeyword);
  }, [debounceKeyword, onSearch]);

  return {
    keyword,
    handleChange,
  };
};

export default useSearch;
