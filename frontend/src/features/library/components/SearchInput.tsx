import useSearch from '../hooks/useSearch';
import { SearchIcon } from '../icons/Search';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
}

// 나중에 로직 안 붙였어요.

const SearchInput = ({ onSearch }: SearchBarProps) => {
  const { keyword, handleChange } = useSearch({ onSearch });

  return (
    <form
      role='search'
      className='mb-6 inline-flex h-12 w-full items-center justify-between rounded-lg bg-gray-50 px-5 py-3.5'
    >
      <input
        aria-label='검색어 입력'
        type='search'
        value={keyword}
        onChange={handleChange}
        placeholder='두 글자 이상 입력 (문항 내부의 질문과 답변에서 검색)'
        className='text-body-s flex-1 justify-start font-normal outline-none placeholder:text-gray-400'
      />
      <div className='flex h-6 w-6 items-center justify-center'>
        <SearchIcon />
      </div>
    </form>
  );
};

export default SearchInput;
