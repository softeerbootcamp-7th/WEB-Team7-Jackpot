import { type ChangeEvent } from 'react';

import { SearchIcon } from '@/shared/icons/Search';

interface SearchInputProps {
  placeholder: string;
  keyword: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  errorMessage: string | null;
}

const SearchInput = ({
  placeholder,
  keyword,
  onChange,
  errorMessage,
}: SearchInputProps) => {
  return (
    <div className='mb-6 w-full max-w-[25rem]'>
      <search
        className={`inline-flex h-12 w-full items-center justify-between rounded-lg px-5 py-3.5 transition-colors ${
          errorMessage
            ? 'border border-red-200 bg-red-50'
            : 'border border-transparent bg-gray-50 focus-within:border-gray-300'
        }`}
      >
        <input
          aria-label='검색어 입력'
          type='search'
          value={keyword}
          onChange={onChange}
          placeholder={placeholder}
          className='text-body-s flex-1 justify-start bg-transparent font-normal outline-none placeholder:text-gray-400'
        />
        <div className='flex h-6 w-6 items-center justify-center text-gray-400'>
          <SearchIcon />
        </div>
      </search>

      {errorMessage && (
        <p className='mt-1 ml-1 text-xs font-medium text-red-500'>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default SearchInput;
