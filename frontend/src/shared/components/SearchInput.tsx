// src/shared/components/SearchInput.tsx
import { type ChangeEvent } from 'react';

import * as SI from '@/shared/icons';

interface SearchInputProps {
  placeholder: string;
  keyword: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput = ({ placeholder, keyword, onChange }: SearchInputProps) => {
  return (
    <div className='w-full max-w-[25rem]'>
      <search className='inline-flex h-12 w-full items-center justify-between rounded-lg border border-transparent bg-gray-50 px-5 py-3.5 transition-colors focus-within:border-gray-300'>
        <input
          aria-label='검색어 입력'
          type='search'
          value={keyword}
          onChange={onChange}
          placeholder={placeholder}
          className='text-body-s flex-1 justify-start bg-transparent font-normal outline-none placeholder:text-gray-400'
        />
        <div className='flex h-6 w-6 items-center justify-center text-gray-400'>
          <SI.SearchIcon />
        </div>
      </search>
    </div>
  );
};

export default SearchInput;
