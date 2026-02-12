import { type ChangeEvent, useEffect, useState } from 'react';

interface UseSearchProps {
  onSearch: (keyword: string) => void;
}

const useSearch = ({ onSearch }: UseSearchProps) => {
  const [keyword, setKeyword] = useState('');
  const [debounceKeyword, setDebounceKeyword] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
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

  return { keyword, handleChange };
};

export default useSearch;
