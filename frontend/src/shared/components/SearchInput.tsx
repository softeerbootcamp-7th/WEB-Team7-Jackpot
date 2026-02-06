import useSearch from '../../features/library/hooks/useSearch';
import { SearchIcon } from '../icons/Search';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  placeholder: string;
}

// 나중에 로직 안 붙였어요.

const SearchInput = ({ onSearch, placeholder }: SearchBarProps) => {
  const { keyword, handleChange } = useSearch({ onSearch });

  return (
    <search
      role='search'
      className='mb-6 inline-flex h-12 w-[25rem] items-center justify-between rounded-lg bg-gray-50 px-5 py-3.5'
    >
      <input
        aria-label='검색어 입력'
        type='search'
        value={keyword}
        onChange={handleChange}
        placeholder={placeholder}
        className='text-body-s flex-1 justify-start font-normal outline-none placeholder:text-gray-400'
      />
      <div className='flex h-6 w-6 items-center justify-center'>
        <SearchIcon />
      </div>
    </search>
  );
};

export default SearchInput;
